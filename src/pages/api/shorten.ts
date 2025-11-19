import { nanoid } from 'nanoid';
import { NextApiRequest, NextApiResponse } from "next";
import { addShortenUrl, getBlockUrl } from "@/lib/utils/query";
import tldts from 'tldts';
import { createClient } from "@/utils/supabase/api";
import { UtmParams } from "@/lib/types";
import { loadBloom } from "@/utils/check_domain";
import { url as isURLZod, regexes } from "zod/mini";

const zodUrl = isURLZod({
  protocol: /^(https?|)$/,
  hostname: regexes.domain,
});

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  const ip = (request.headers['x-vercel-forwarded-for'] ?? request.headers['x-forwarded-for'] ?? request.headers['x-real-ip'] ?? null) as string;
  const countryCode = (request.headers['x-vercel-ip-country'] ?? null) as string;

  const { url, utm } = request.body;

  if (!url || !zodUrl.safeParse(url).success) {
    return response.status(400).json({ error: 'URL is required' });
  }

  // Normalizar URL
  let urlWithSuffix = url.trim();
  if (!/^https?:\/\//i.test(urlWithSuffix)) {
    urlWithSuffix = 'https://' + urlWithSuffix;
  }

  const urlInfo = tldts.parse(urlWithSuffix);
  if(urlInfo.domain === null || urlInfo.isIp || ["iny.one", "localhost"].includes(urlInfo.domain)) {
    console.log('❌ La URL ingresada no es válida:', urlWithSuffix)
    return response.status(400).json({ code: 1000 });
  }

  const bannedDomains = loadBloom();
  if(bannedDomains.has(urlInfo.domain)) {
    const urlBanned = await getBlockUrl(urlInfo.domain);

    if(urlBanned.error) {
      console.error(urlBanned.error);
      return response.status(400).json({ code: 3001 });
    }

    if(urlBanned.data !== null && urlBanned.data === false) {
      console.log('❗ El dominio de la URL ingresada está baneada:', urlWithSuffix);
      return response.status(400).json({ code: 3001 });
    }
  }

  const { destination, utm: utmParams } = buildDestination(urlWithSuffix, utm);
  console.log(destination);

  const supabase = createClient(request, response);
  const user = await supabase.auth.getUser();
  const uid: string|null = user.data.user?.id ?? null;

  const slug = nanoid(7);
  const { error } = await addShortenUrl(uid, slug, destination, utmParams, urlInfo.domain, {
    ip,
    countryCode,
  });

  if (error) {
    console.error('Supabase insert error:', error);
    return response.status(500).json({ error: 'Error saving URL in database' });
  }

  const data = {
    code: 0,
    message: null,
    data: {
      short: `https://iny.one/${slug}`
    }
  }
  response.status(200).json(data);
}

const buildDestination = (url: string, utm: Partial<UtmParams>) => {
  const sanitize = (value: string | null) =>
    value && value.replace(/[^a-zA-Z0-9-_]/g, '')

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
