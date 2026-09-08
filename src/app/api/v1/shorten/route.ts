import { withErrorHandling } from "@/lib/api/http";
import { NextRequest } from "next/server";
import { UserPlanSummary } from "@/lib/types";
import * as z from "zod/mini";
import { ApiError, SessionNotFoundError, ValidationError } from "@/lib/api/errors";
import { successResponse } from "@/lib/api/responses";
import { getUserRepository } from "@/infra/db/user.repository";
import {
  getShorterRepository,
  type CreateShortLinkInput,
  type ShorterRepository,
} from "@/infra/db/shorter.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { isUniqueViolation } from "@/infra/db/db-errors";
import { createClient } from "@/lib/supabase/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { checkRateLimit, recordRateLimitUsage } from "@/lib/utils/rate-limits";
import { getAccessContext } from "@/features/authorization/helpers/access";
import { EntitlementService } from "@/features/authorization/services/entitlement.service";
import { ERROR } from "@/lib/api/error-codes";
import {
  generateSlug,
  isValidCustomSlug,
  normalizeCustomSlug,
  MAX_SLUG_INSERT_ATTEMPTS,
} from "@/lib/short-links/slug";
import { isReservedSlug, normalizeSlug } from "@/lib/reserved-slugs";
import { buildDestination, type DestinationPlan } from "@/lib/short-links/destination";
import { validateDestination } from "@/lib/short-links/validate-destination";
import { ANONYMOUS_LINK_TTL_DAYS } from "@/lib/short-links/expiry";
import { logger } from "@/lib/logger";

dayjs.extend(utc);

const log = logger.child({ route: 'api/v1/shorten' });

const schemaShortenBody = z.object({
  url: z.url({
    protocol: /^(https?|)$/,
    hostname: z.regexes.domain,
  }),
  utm: z.object({
    source: z.string(),
    medium: z.string(),
    campaign: z.string(),
  }),
  // Nombre elegido por el usuario. Opcional: sin él se genera uno aleatorio.
  slug: z.optional(z.string()),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = schemaShortenBody.safeParse(await request.json());

  if (!body.success) {
    throw new ValidationError();
  }

  const { url, utm, slug: requestedSlug } = body.data;

  const ip = request.headers.get('x-vercel-forwarded-for')
    ?? request.headers.get('x-forwarded-for')
    ?? request.headers.get('x-real-ip');
  const countryCode = request.headers.get('x-vercel-ip-country');

  const shorterRepo = getShorterRepository(supabase_service);
  const { target, domain } = await validateDestination(url, shorterRepo);

  const supabase = await createClient();
  const userRepo = getUserRepository(supabase);
  const { data: currUser } = await userRepo.getCurrentUser();

  const userId = currUser.user?.id ?? null;
  const plan = currUser.plan;

  // Elegir el nombre del enlace es la contrapartida de registrarse. Se comprueba
  // antes de tocar la cuota para que un anónimo no gaste un enlace en una
  // petición que se va a rechazar de todos modos.
  const customSlug = resolveCustomSlug(requestedSlug, userId);

  // La cuota vive en los entitlements del servicio contratado. Se resuelve aquí,
  // donde ya hay sesión, y se inyecta: `checkRateLimit` sólo cuenta.
  const access = await getAccessContext();
  const entitlementLimit = new EntitlementService().getNumber(access, "links.max_per_month");

  const rateLimit = await checkRateLimit({
    userId,
    plan: plan?.name ?? null,
    ip,
    repo: shorterRepo,
    limit: entitlementLimit,
  });
  if (!rateLimit.allowed) {
    throw new ApiError(
      ERROR.RATE_LIMIT_EXCEEDED,
      `Monthly limit reached for plan ${rateLimit.plan}: ${rateLimit.limit} links.`,
      { status: 429 },
    );
  }

  const { destination, utm: utmParams } = buildDestination(target, utm, toDestinationPlan(plan, userId));

  const input: Omit<CreateShortLinkInput, 'slug'> = {
    userId,
    destination,
    utm: utmParams,
    domain,
    expires: userId ? undefined : buildAnonymousExpiry(),
    client: { ip, countryCode },
  };

  const slug = customSlug
    ? await createWithChosenSlug(shorterRepo, input, customSlug)
    : await createWithUniqueSlug(shorterRepo, input);

  recordRateLimitUsage(rateLimit);

  return successResponse({
    short: `https://iny.one/${slug}`
  });
});

/**
 * Valida el slug propuesto y comprueba que quien lo pide puede pedirlo.
 * Devuelve `null` cuando no se propuso ninguno.
 */
function resolveCustomSlug(requested: string | undefined, userId: string | null): string | null {
  const raw = requested?.trim();
  if (!raw) return null;

  if (!userId) {
    log.info('rejected custom slug without session');
    throw new SessionNotFoundError("A free account is required to choose the link name");
  }

  const slug = normalizeCustomSlug(raw);

  if (!isValidCustomSlug(slug) || isReservedSlug(normalizeSlug(slug))) {
    log.info({ slug }, 'rejected custom slug');
    throw new ValidationError("Invalid custom slug");
  }

  return slug;
}

function toDestinationPlan(plan: UserPlanSummary | null, userId: string | null): DestinationPlan {
  if (!userId) return 'freeAnonymous';
  return plan?.name ?? 'free';
}

function buildAnonymousExpiry() {
  return {
    expires_in_days: ANONYMOUS_LINK_TTL_DAYS,
    expires_at: dayjs.utc().add(ANONYMOUS_LINK_TTL_DAYS, 'day').toISOString(),
  };
}

/**
 * Inserta con el nombre que pidió el usuario. Un solo intento a propósito:
 * reintentar con otro slug le daría un enlace que no pidió, así que la colisión
 * se devuelve como conflicto para que elija otro nombre.
 *
 * No hay endpoint previo de «¿está libre?», por el mismo motivo que no lo hay en
 * la ruta aleatoria: no elimina la condición de carrera —entre la consulta y el
 * insert alguien puede tomarlo— y además permitiría enumerar qué nombres están
 * ocupados. La violación del índice único es la única fuente de verdad.
 */
async function createWithChosenSlug(
  repo: ShorterRepository,
  input: Omit<CreateShortLinkInput, 'slug'>,
  slug: string,
): Promise<string> {
  const { error } = await repo.create({ ...input, slug });

  if (!error) return slug;

  if (isUniqueViolation(error)) {
    log.info({ slug }, 'custom slug already taken');
    throw new ApiError(ERROR.DUPLICATE_ENTRY, "That link name is already taken", { status: 409 });
  }

  log.error(error, 'failed to create short link');
  throw new ApiError("SERVER_ERROR", "internal server error", { status: 500 });
}

/**
 * Inserta el link generando un slug nuevo en cada intento.
 *
 * Se inserta de forma optimista en lugar de comprobar antes si el slug existe:
 * una comprobación previa no elimina la condición de carrera (dos peticiones
 * simultáneas podrían leer «libre» y chocar igual) y añade una consulta a cada
 * creación. El índice único de la tabla es la única garantía real, así que se
 * usa su violación como señal para reintentar.
 */
async function createWithUniqueSlug(
  repo: ShorterRepository,
  input: Omit<CreateShortLinkInput, 'slug'>,
): Promise<string> {
  for (let attempt = 1; attempt <= MAX_SLUG_INSERT_ATTEMPTS; attempt++) {
    const slug = generateSlug();
    const { error } = await repo.create({ ...input, slug });

    if (!error) return slug;

    if (!isUniqueViolation(error)) {
      log.error(error, 'failed to create short link');
      throw new ApiError("SERVER_ERROR", "internal server error", { status: 500 });
    }

    log.warn({ attempt, maxAttempts: MAX_SLUG_INSERT_ATTEMPTS }, 'slug collision, retrying');
  }

  log.error({ maxAttempts: MAX_SLUG_INSERT_ATTEMPTS }, 'exhausted slug attempts');
  throw new ApiError("SERVER_ERROR", "internal server error", { status: 500 });
}
