'use server';

import { getUserRepository } from "@/infra/db/user.repository";
import { getShorterRepository } from "@/infra/db/shorter.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { createClient } from "@/lib/supabase/server";
import { buildDestination, type DestinationPlan } from "@/lib/short-links/destination";
import { validateDestination } from "@/lib/short-links/validate-destination";
import { isValidAlias, normalizeAlias } from "@/lib/short-links/alias";
import { ApiError } from "@/lib/api/errors";
import { logger } from "@/lib/logger";

const log = logger.child({ action: 'updateLink' });

export type LinkEditState = {
  slug: string;
  alias: string;
  destination?: string;
  success?: boolean;
  /** Motivo del fallo, para que la interfaz no muestre siempre el mismo texto. */
  reason?: 'alias' | 'destination' | 'forbidden' | 'unknown';
};

/**
 * Aplica un parche parcial sobre un enlace: alias, destino, o ambos.
 *
 * Es una sola acción y no dos porque la ceremonia —sesión, propiedad, logging,
 * forma del estado— es idéntica; separarlas duplicaría treinta líneas para
 * cambiar qué columna se escribe.
 */
export async function updateLinkAction(
  initialState: LinkEditState,
  formData: FormData,
): Promise<LinkEditState> {
  const slug = initialState.slug;
  const alias = readField(formData, 'alias');
  const destination = readField(formData, 'destination');

  if (!slug) return fail(initialState, 'unknown');

  const supabase = await createClient();
  const userRepo = getUserRepository(supabase);

  const { data: currUser } = await userRepo.getCurrentUser();
  const user = currUser.user;

  if (!user) {
    log.info('rejected edit without session', { slug });
    return fail(initialState, 'forbidden');
  }

  const { data: isOwner } = await userRepo.isOwner(user.id, slug);
  if (!isOwner) {
    log.warn('rejected edit from non-owner', { slug, userId: user.id });
    return fail(initialState, 'forbidden');
  }

  const next: LinkEditState = { ...initialState };

  if (destination !== null) {
    const updated = await applyDestination({
      slug,
      rawDestination: destination,
      userId: user.id,
      plan: currUser.plan?.name ?? 'free',
      userRepo,
    });

    if (!updated.ok) return fail(initialState, 'destination');
    if (updated.destination) next.destination = updated.destination;
  }

  if (alias !== null) {
    if (!isValidAlias(alias)) {
      log.info('rejected alias', { slug });
      return fail(initialState, 'alias');
    }

    const { error } = await userRepo.changeAlias(slug, normalizeAlias(alias));

    if (error) {
      log.error('failed to change alias', { slug, error });
      return fail(initialState, 'alias');
    }

    next.alias = alias;
  }

  log.info('link updated', {
    slug,
    changedAlias: alias !== null,
    changedDestination: destination !== null,
  });

  return { ...next, success: true, reason: undefined };
}

type ApplyDestinationInput = {
  slug: string;
  rawDestination: string;
  userId: string;
  plan: DestinationPlan;
  userRepo: ReturnType<typeof getUserRepository>;
};

/**
 * Valida, recompone y escribe el destino nuevo, y deja rastro del cambio.
 *
 * El destino pasa por `validateDestination`, la misma puerta que usa la
 * creación: sin eso, el blocklist de dominios sería evitable creando un enlace
 * hacia un destino limpio y repuntándolo después.
 */
async function applyDestination(
  { slug, rawDestination, userId, plan, userRepo }: ApplyDestinationInput,
): Promise<{ ok: boolean; destination?: string }> {
  if (!rawDestination.trim()) return { ok: false };

  const shorterRepo = getShorterRepository(supabase_service);

  const { data: current, error: readError } = await userRepo.getLinkForEdit(slug);

  // `destination` es nullable en el esquema aunque en la práctica nunca lo sea:
  // se comprueba en vez de forzar el tipo, porque el rastro de auditoría lo
  // necesita y un null aquí significaría una fila corrupta, no un caso normal.
  if (readError || !current?.destination) {
    log.error('failed to read link before destination change', { slug, error: readError });
    return { ok: false };
  }

  const currentDestination = current.destination;

  let target: string;
  try {
    ({ target } = await validateDestination(rawDestination, shorterRepo));
  } catch (err) {
    log.info('rejected new destination', { slug, code: err instanceof ApiError ? err.code : 'unknown' });
    return { ok: false };
  }

  // `destination` guarda la URL ya compuesta con las UTM, así que hay que
  // recomponerlas con las que ya tenía el enlace o el cambio las perdería.
  const { destination } = buildDestination(target, {
    source: current.utm_source,
    medium: current.utm_medium,
    campaign: current.utm_campaign,
    term: current.utm_term,
    content: current.utm_content,
    id: current.utm_id,
  }, plan);

  if (destination === currentDestination) return { ok: true };

  const { data: updated, error } = await userRepo.changeDestination(slug, destination);

  if (error) {
    log.error('failed to change destination', { slug, error });
    return { ok: false };
  }

  // Cero filas sin error es el fallo característico de PostgREST cuando RLS
  // deniega. Se trata como fallo explícito en lugar de darlo por bueno.
  if (!updated || updated.length === 0) {
    log.error('destination update affected no rows', { slug, userId });
    return { ok: false };
  }

  const { error: auditError } = await shorterRepo.logDestinationChange({
    slug,
    oldDestination: currentDestination,
    newDestination: destination,
    changedBy: userId,
  });

  if (auditError) log.error('failed to write destination audit row', { slug, error: auditError });

  return { ok: true, destination };
}

/** `null` cuando el campo no viene en el formulario: esa columna no se toca. */
function readField(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === 'string' ? value : null;
}

function fail(state: LinkEditState, reason: LinkEditState['reason']): LinkEditState {
  return { ...state, success: false, reason };
}
