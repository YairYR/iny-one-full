import { withErrorHandling } from "@/lib/api/http";
import { NextRequest } from "next/server";
import { parse as parseUrl } from "tldts";
import {PlanName, UserPlanSummary} from "@/lib/types";
import { loadBloom } from "@/lib/utils/check_domain";
import * as z from "zod/mini";
import { ApiError, ValidationError } from "@/lib/api/errors";
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
import { ERROR } from "@/lib/api/error-codes";
import { generateSlug, MAX_SLUG_INSERT_ATTEMPTS } from "@/lib/short-links/slug";
import { buildDestination, type DestinationPlan } from "@/lib/short-links/destination";
import { ANONYMOUS_LINK_TTL_DAYS } from "@/lib/short-links/expiry";
import { logger } from "@/lib/logger";

dayjs.extend(utc);

const log = logger.child({ route: 'api/shorten' });

/** Dominios que nunca pueden ser destino de un link. */
const BLOCKED_DOMAINS = new Set(['iny.one', 'localhost']);

const schemaShortenBody = z.object({
  url: z.url({
    protocol: /^(https?|)$/,
    hostname: z.regexes.domain,
  }),
  utm: z.object({
    source: z.string(),
    medium: z.string(),
    campaign: z.string(),
  })
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = schemaShortenBody.safeParse(await request.json());

  if (!body.success) {
    throw new ValidationError();
  }

  const { url, utm } = body.data;

  const ip = request.headers.get('x-vercel-forwarded-for')
    ?? request.headers.get('x-forwarded-for')
    ?? request.headers.get('x-real-ip');
  const countryCode = request.headers.get('x-vercel-ip-country');

  const target = withProtocol(url.trim());
  const urlInfo = parseUrl(target);

  if (urlInfo.domain === null || urlInfo.isIp || BLOCKED_DOMAINS.has(urlInfo.domain)) {
    log.info('rejected destination url', { domain: urlInfo.domain, isIp: urlInfo.isIp });
    throw new ValidationError("Invalid url provided");
  }

  const shorterRepo = getShorterRepository(supabase_service);
  await assertDomainIsAllowed(urlInfo.domain, shorterRepo);

  const supabase = await createClient();
  const userRepo = getUserRepository(supabase);
  const { data: currUser } = await userRepo.getCurrentUser();

  const userId = currUser.user?.id ?? null;
  const plan = currUser.plan;

  const rateLimit = await checkRateLimit({ userId, plan: plan?.name ?? null, ip, repo: shorterRepo });
  if (!rateLimit.allowed) {
    throw new ApiError(
      ERROR.RATE_LIMIT_EXCEEDED,
      `Monthly limit reached for plan ${rateLimit.plan}: ${rateLimit.limit} links.`,
      { status: 429 },
    );
  }

  const { destination, utm: utmParams } = buildDestination(target, utm, toDestinationPlan(plan, userId));

  const slug = await createWithUniqueSlug(shorterRepo, {
    userId,
    destination,
    utm: utmParams,
    domain: urlInfo.domain,
    expires: userId ? undefined : buildAnonymousExpiry(),
    client: { ip, countryCode },
  });

  recordRateLimitUsage(rateLimit);

  return successResponse({
    short: `https://iny.one/${slug}`
  });
});

function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
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
 * El filtro de Bloom descarta la mayoría de dominios sin tocar la base de datos;
 * sólo los positivos (incluidos los falsos positivos) se confirman contra ella.
 */
async function assertDomainIsAllowed(domain: string, repo: ShorterRepository): Promise<void> {
  if (!loadBloom().has(domain)) return;

  const { data, error } = await repo.isSafeDomain(domain);

  if (error) {
    log.error('domain safety check failed', { domain, error });
    throw new ValidationError("Error when validating url");
  }

  if (data === false) {
    log.warn('blocked banned domain', { domain });
    throw new ValidationError("Error when validating url");
  }
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
      log.error('failed to create short link', { error });
      throw new ApiError("SERVER_ERROR", "internal server error", { status: 500 });
    }

    log.warn('slug collision, retrying', { attempt, maxAttempts: MAX_SLUG_INSERT_ATTEMPTS });
  }

  log.error('exhausted slug attempts', { maxAttempts: MAX_SLUG_INSERT_ATTEMPTS });
  throw new ApiError("SERVER_ERROR", "internal server error", { status: 500 });
}
