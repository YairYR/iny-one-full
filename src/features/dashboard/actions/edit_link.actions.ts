'use server';

import { getUserRepository } from "@/infra/db/user.repository";
import { getShorterRepository } from "@/infra/db/shorter.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { createClient } from "@/lib/supabase/server";
import { buildDestination, toDestinationPlan, type DestinationPlan } from "@/lib/short-links/destination";
import { getEffectiveService } from "@/features/authorization/helpers/access";
import { validateDestination } from "@/lib/short-links/validate-destination";
import { isValidAlias, normalizeAlias } from "@/lib/short-links/alias";
import { ApiError } from "@/lib/api/errors";
import { logger } from "@/lib/logger";

const log = logger.child({ action: 'updateLink' });

export type LinkEditState = {
  link_id: string;
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
  const link_id = initialState.link_id;
  const slug = initialState.slug;
  const alias = readField(formData, 'alias');
  const destination = readField(formData, 'destination');

  if (!link_id) return fail(initialState, 'unknown');

  const supabase = await createClient();
  const userRepo = getUserRepository(supabase);

  const { data: currUser } = await userRepo.getCurrentUser();
  const user = currUser.user;

  if (!user) {
    log.info({ link_id }, 'rejected edit without session');
    return fail(initialState, 'forbidden');
  }

  const { data: isOwner, error: ownerError } = await userRepo.isOwner(user.id, slug, link_id);
  if (ownerError) {
    log.error(ownerError, 'failed to verify link owner');
    return fail(initialState, 'unknown');
  }
  if (!isOwner) {
    log.warn({ link_id, userId: user.id }, 'rejected edit from non-owner');
    return fail(initialState, 'forbidden');
  }

  const next: LinkEditState = { ...initialState };
  const values: { name?: string | null; destination?: string } = {};
  let oldDestination: string | undefined;

  if (alias !== null && !isValidAlias(alias)) {
    log.info({ link_id }, 'rejected alias');
    return fail(initialState, 'alias');
  }

  if (destination !== null) {
    // El plan sale del servicio efectivo, no del JWT: editar un enlace reescribe
    // el destino con `buildDestination`, y con el plan desactualizado un
    // suscriptor perdía en la edición los UTM que su plan sí permite.
    const services = await getEffectiveService();
    if (!services || services.length !== 1) {
      log.error(null, 'effective service not found');
      return fail(initialState, 'unknown');
    }
    const access = services[0];

    const updated = await prepareDestination({
      link_id,
      slug,
      rawDestination: destination,
      plan: toDestinationPlan(access.plan_key, access.anonymous),
      userRepo,
    });

    if (!updated.ok) return fail(initialState, 'destination');
    if (updated.destination) {
      values.destination = updated.destination;
      oldDestination = updated.oldDestination;
      next.destination = updated.destination;
    }
  }

  if (alias !== null) {
    values.name = normalizeAlias(alias);
    next.alias = alias;
  }

  if (Object.keys(values).length) {
    const { data, error } = await userRepo.updateLink(link_id, values);
    if (error || !data?.length) {
      log.error(error, 'failed to update link for %s', link_id);
      return fail(initialState, destination !== null ? 'destination' : 'alias');
    }
  }

  if (values.destination && oldDestination) {
    const shorterRepo = getShorterRepository(supabase_service);
    const { error } = await shorterRepo.logDestinationChange({
      link_id,
      oldDestination,
      newDestination: values.destination,
      changedBy: user.id,
    });
    if (error) log.error(error, 'failed to write destination audit row for %s', link_id);
  }

  log.info({
    link_id,
    changedAlias: alias !== null,
    changedDestination: destination !== null,
  }, 'link updated');

  return { ...next, success: true, reason: undefined };
}

type ApplyDestinationInput = {
  link_id: string;
  slug: string;
  rawDestination: string;
  plan: DestinationPlan;
  userRepo: ReturnType<typeof getUserRepository>;
};

/**
 * Valida y recompone el destino antes de realizar cualquier escritura.
 *
 * El destino pasa por `validateDestination`, la misma puerta que usa la
 * creación: sin eso, el blocklist de dominios sería evitable creando un enlace
 * hacia un destino limpio y repuntándolo después.
 */
async function prepareDestination(
  { link_id, slug, rawDestination, plan, userRepo }: ApplyDestinationInput,
): Promise<{ ok: boolean; destination?: string; oldDestination?: string }> {
  if (!rawDestination.trim()) return { ok: false };

  const { data: current, error: readError } = await userRepo.getLinkForEdit(link_id);

  // `destination` es nullable en el esquema aunque en la práctica nunca lo sea:
  // se comprueba en vez de forzar el tipo, porque el rastro de auditoría lo
  // necesita y un null aquí significaría una fila corrupta, no un caso normal.
  if (readError || !current?.destination) {
    log.error(readError, 'failed to read link before destination change for %s', link_id);
    return { ok: false };
  }

  const currentDestination = current.destination;

  let target: string;
  try {
    ({ target } = await validateDestination(rawDestination));
  } catch (err) {
    log.info({ slug, code: err instanceof ApiError ? err.code : 'unknown' }, 'rejected new destination');
    return { ok: false };
  }

  // `destination` guarda la URL ya compuesta con las UTM, así que hay que
  // recomponerlas con las que ya tenía el enlace o el cambio las perdería.
  const { destination } = buildDestination(target, {
    source: current.utms?.utm_source,
    medium: current.utms?.utm_medium,
    campaign: current.utms?.utm_campaign,
    term: current.utms?.utm_term,
    content: current.utms?.utm_content,
    id: current.utms?.utm_id,
  }, plan);

  if (destination === currentDestination) return { ok: true };

  return { ok: true, destination, oldDestination: currentDestination };
}

/** `null` cuando el campo no viene en el formulario: esa columna no se toca. */
function readField(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === 'string' ? value : null;
}

function fail(state: LinkEditState, reason: LinkEditState['reason']): LinkEditState {
  return { ...state, success: false, reason };
}
