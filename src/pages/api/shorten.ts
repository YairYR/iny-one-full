import { nanoid } from 'nanoid';
import { NextApiRequest, NextApiResponse } from "next";
import { addShortenUrl, getBlockUrl } from "@/lib/utils/query";
import tldts from 'tldts';
import validator, { IsURLOptions } from 'validator';
import { createClient } from "@/utils/supabase/api";

const urlOptions: IsURLOptions = {
  protocols: ['http', 'https'],
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'PUT') {
    return response.status(405).end();
  }

  const ip = (request.headers['x-vercel-forwarded-for'] ?? request.headers['x-forwarded-for'] ?? request.headers['x-real-ip'] ?? null) as string;
  const countryCode = (request.headers['x-vercel-ip-country'] ?? null) as string;

  const { url, utm } = request.body;

  if (!url || !validator.isURL(url, urlOptions)) {
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
    return response.status(500).end();
  }

  const urlBanned = await getBlockUrl(urlInfo.domain);

  if(urlBanned.error) {
    console.error(urlBanned.error);
    return response.status(500).end();
  }

  if(urlBanned.data !== null && urlBanned.data === false) {
    console.log('❗ El dominio de la URL ingresada está baneada:', urlWithSuffix);
    return response.status(500).end();
  }

  const destination = buildDestination(urlWithSuffix, utm);
  console.log(destination);

  const supabase = createClient(request, response);
  const user = await supabase.auth.getUser();
  const uid: string|null = user.data.user?.id ?? null;

  const slug = nanoid(6);
  const { error } = await addShortenUrl(uid, slug, destination, utm, urlInfo.domain, {
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
  const sanitize = (value: string) =>
    value.replace(/[^a-zA-Z0-9-_]/g, '')

  const destination = new URL(url);
  if(utm?.source) destination.searchParams.set('utm_source', sanitize(utm.source.trim()));
  if(utm?.medium) destination.searchParams.set('utm_medium', sanitize(utm.medium.trim()));
  if(utm?.campaign) destination.searchParams.set('utm_campaign', sanitize(utm.campaign.trim()));

  return decodeURI(destination.toString());
}

interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
}