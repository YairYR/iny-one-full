import { withErrorHandling } from "@/lib/api/http";
import { NextRequest } from "next/server";
import { nanoid } from 'nanoid';
import { parse as parseUrl } from 'tldts';
import { UtmParams } from "@/lib/types";
import { loadBloom } from "@/utils/check_domain";
import * as z from "zod/mini";
import { ApiError, ValidationError } from "@/lib/api/errors";
import { successResponse } from "@/lib/api/responses";
import { getUserRepository } from "@/infra/db/user.repository";
import { getShorterRepository } from "@/infra/db/shorter.repository";
import { supabase_service } from "@/infra/db/supabase_service";

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
})

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

  // Normalizar URL
  let urlWithSuffix = url.trim();
  if (!/^https?:\/\//i.test(urlWithSuffix)) {
    urlWithSuffix = 'https://' + urlWithSuffix;
  }

  const urlInfo = parseUrl(urlWithSuffix);
  if(urlInfo.domain === null || urlInfo.isIp || ["iny.one", "localhost"].includes(urlInfo.domain)) {
    console.log('❌ La URL ingresada no es válida:', urlWithSuffix);
    throw new ValidationError("Invalid url provided");
  }

  const shorterRepo = getShorterRepository(supabase_service);

  const bannedDomains = loadBloom();
  if(bannedDomains.has(urlInfo.domain)) {
    const urlBanned = await shorterRepo.isSafeDomain(urlInfo.domain);

    if(urlBanned.error) {
      console.error(urlBanned.error);
      throw new ValidationError("Error when validating url");
    }

    if(urlBanned.data !== null && urlBanned.data === false) {
      console.log('❗ El dominio de la URL ingresada está baneada:', urlWithSuffix);
      throw new ValidationError("Error when validating url");
    }
  }

  const { destination, utm: utmParams } = buildDestination(urlWithSuffix, utm);
  console.log(destination);

  const userRepo = getUserRepository(supabase_service);
  const user_id = await userRepo.getCurrentUserId();
  const slug = nanoid(7);
  const { error } = await shorterRepo.create(user_id, slug, destination, utmParams, urlInfo.domain, {
    ip,
    countryCode,
  });

  if(error) {
    console.error('Supabase insert error:', error);
    throw new ApiError("SERVER_ERROR", "internal server error", { status: 500 });
  }

  return successResponse({
    short: `https://iny.one/l/${slug}`
  });
})

const buildDestination = (url: string, utm: Partial<UtmParams>) => {
  const sanitize = (value: string | null) =>
    value?.replaceAll(/[^a-zA-Z0-9-_]/, '')

  const destination = new URL(url);
  const utmDestination: UtmParams = {
    source: sanitize(utm?.source ?? destination.searchParams.get('utm_source')) ?? null as unknown as string,
    medium: sanitize(utm?.medium ?? destination.searchParams.get('utm_medium')) ?? null as unknown as string,
    campaign: sanitize(utm?.campaign ?? destination.searchParams.get('utm_campaign')) ?? null as unknown as string,
    term: sanitize(destination.searchParams.get('utm_term')) ?? null as unknown as string,
    content: sanitize(destination.searchParams.get('utm_content')) ?? null as unknown as string,
    id: sanitize(destination.searchParams.get('utm_id')) ?? null as unknown as string,
  };
  if(utmDestination.source) destination.searchParams.set('utm_source', utmDestination.source);
  if(utmDestination.medium) destination.searchParams.set('utm_medium', utmDestination.medium);
  if(utmDestination.campaign) destination.searchParams.set('utm_campaign', utmDestination.campaign);

  return {
    destination: decodeURI(destination.toString()),
    utm: utmDestination,
  }
}
