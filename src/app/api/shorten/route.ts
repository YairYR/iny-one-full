import { withErrorHandling } from "@/lib/api/http";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { parse as parseUrl } from "tldts";
import { PlanName, UrlExpires, UtmParams } from "@/lib/types";
import { loadBloom } from "@/lib/utils/check_domain";
import * as z from "zod/mini";
import { ApiError, ValidationError } from "@/lib/api/errors";
import { successResponse } from "@/lib/api/responses";
import { getUserRepository } from "@/infra/db/user.repository";
import { getShorterRepository } from "@/infra/db/shorter.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { createClient } from "@/lib/supabase/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { checkRateLimit } from "@/lib/utils/rate-limits";
import { ERROR } from "@/lib/api/error-codes";
import { ALLOWED_PARAMS } from "@/lib/routes";
import { isReservedSlug } from "@/lib/reserved-slugs";

dayjs.extend(utc);

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

const generateSafeSlug = (size = 7, maxAttempts = 25): string => {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = nanoid(size).toLowerCase();

    if (!isReservedSlug(candidate)) {
      return candidate;
    }
  }

  throw new ApiError("SERVER_ERROR", "could not generate a valid slug", { status: 500 });
};

export const POST = withErrorHandling(async (request: NextRequest, ctx: RouteContext<'/api/shorten'>) => {
  const bodyNoValidated = await request.json();
  const body = schemaShortenBody.safeParse(bodyNoValidated);

  if (!body.success || body.error) {
    throw new ValidationError();
  }

  const { url, utm } = body.data;

  const ip = (request.headers.get('x-vercel-forwarded-for')
            ?? request.headers.get('x-forwarded-for')
            ?? request.headers.get('x-real-ip') ?? null) as string;
  const countryCode = (request.headers.get('x-vercel-ip-country') ?? null) as string;

  let urlWithSuffix = url.trim();
  if (!/^https?:\/\//i.test(urlWithSuffix)) {
    urlWithSuffix = 'https://' + urlWithSuffix;
  }

  const urlInfo = parseUrl(urlWithSuffix);
  if (urlInfo.domain === null || urlInfo.isIp || ["iny.one", "localhost"].includes(urlInfo.domain)) {
    console.log('❌ La URL ingresada no es válida:', urlWithSuffix);
    throw new ValidationError("Invalid url provided");
  }

  const shorterRepo = getShorterRepository(supabase_service);

  const bannedDomains = loadBloom();
  if (bannedDomains.has(urlInfo.domain)) {
    const urlBanned = await shorterRepo.isSafeDomain(urlInfo.domain);

    if (urlBanned.error) {
      console.error(urlBanned.error);
      throw new ValidationError("Error when validating url");
    }

    if (urlBanned.data !== null && urlBanned.data === false) {
      console.log('❗ El dominio de la URL ingresada está baneada:', urlWithSuffix);
      throw new ValidationError("Error when validating url");
    }
  }

  const supabase = await createClient();
  const userRepo = getUserRepository(supabase);
  const { data: currUser } = await userRepo.getCurrentUser();

  const slug = generateSafeSlug(7);
  const user_id = currUser.user?.id ?? null;
  const plan = currUser.plan;

  const { destination, utm: utmParams } = buildDestination(urlWithSuffix, utm, plan ?? 'freeAnonymous');
  

  const rateLimitResult = await checkRateLimit(user_id, plan, ip, shorterRepo);
  if (!rateLimitResult.allowed) {
    throw new ApiError(ERROR.RATE_LIMIT_EXCEEDED, rateLimitResult.message || "Rate limit exceeded", { status: 429 });
  }

  let expires: UrlExpires | undefined;
  if (!user_id) {
    const expires_in_days = 180;
    expires = {
      expires_in_days,
      expires_at: dayjs.utc().add(expires_in_days, 'day').toISOString()
    };
  }

  const { error } = await shorterRepo.create(user_id, slug, destination, utmParams, urlInfo.domain, expires, {
    ip,
    countryCode,
  });

  if (error) {
    console.error('Supabase insert error:', error);
    throw new ApiError("SERVER_ERROR", "internal server error", { status: 500 });
  }

  return successResponse({
    short: `https://iny.one/${slug}`
  });
});

const buildDestination = (url: string, utm: Partial<UtmParams>, plan: PlanName | 'freeAnonymous') => {
  const sanitize = (value: string | null) =>
    value?.replaceAll(/[^a-zA-Z0-9-_]/g, '');

  const destination = new URL(url);
  const utmDestination: UtmParams = {
    source: sanitize(utm?.source ?? destination.searchParams.get('utm_source')) ?? null as unknown as string,
    medium: sanitize(utm?.medium ?? destination.searchParams.get('utm_medium')) ?? null as unknown as string,
    campaign: sanitize(utm?.campaign ?? destination.searchParams.get('utm_campaign')) ?? null as unknown as string,
    term: sanitize(utm?.term ?? destination.searchParams.get('utm_term')) ?? null as unknown as string,
    content: sanitize(utm?.content ?? destination.searchParams.get('utm_content')) ?? null as unknown as string,
    id: sanitize(utm?.id ?? destination.searchParams.get('utm_id')) ?? null as unknown as string,
  };

  if (utmDestination.source) destination.searchParams.set('utm_source', utmDestination.source);
  if (utmDestination.medium) destination.searchParams.set('utm_medium', utmDestination.medium);
  if (utmDestination.campaign) destination.searchParams.set('utm_campaign', utmDestination.campaign);

  const allowdParams = ALLOWED_PARAMS[plan];
  destination.searchParams.keys().forEach((param) => {
    if (param.startsWith('utm_') && !allowdParams.includes(param)) {
      destination.searchParams.delete(param);
    } else {
      destination.searchParams.set(param, utmDestination[param.replace('utm_', '') as keyof UtmParams]);
    }
  });

  return {
    destination: decodeURI(destination.toString()),
    utm: utmDestination,
  };
};
