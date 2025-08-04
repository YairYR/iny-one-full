import { nanoid } from 'nanoid';
import { NextApiRequest, NextApiResponse } from "next";
import { addShortenUrl, getBlockUrl } from "@/lib/utils/query";
import tldts from 'tldts';
import validator, { IsURLOptions } from 'validator';

const urlOptions: IsURLOptions = {
  protocols: ['http', 'https'],
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const ip = (req.headers['x-forwarded-for'] as string) ?? null;
  const countryCode = (req.headers['x-forwarded-for-code'] as string) ?? null;

  const { url, utm } = req.body;

  if (!url || !validator.isURL(url, urlOptions)) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Normalizar URL
  let urlWithSuffix = url.trim();
  if (!/^https?:\/\//i.test(urlWithSuffix)) {
    urlWithSuffix = 'https://' + urlWithSuffix;
  }

  const urlInfo = tldts.parse(urlWithSuffix);
  if(urlInfo.domain === null || urlInfo.isIp || ["iny.one", "localhost"].includes(urlInfo.domain)) {
    console.log('❌ La URL ingresada no es válida:', urlWithSuffix)
    return res.status(500).end();
  }

  const urlBanned = await getBlockUrl(urlInfo.domain);

  if(urlBanned.error) {
    console.error(urlBanned.error);
    return res.status(500).end();
  }

  if(urlBanned.data !== null && urlBanned.data === false) {
    console.log('❗ El dominio de la URL ingresada está baneada:', urlWithSuffix);
    return res.status(500).end();
  }

  const destination = buildDestination(urlWithSuffix, utm);
  console.log(destination);

  const slug = nanoid(6);
  const { error } = await addShortenUrl(slug, destination, utm, urlInfo.domain, {
    ip,
    countryCode,
  });

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ error: 'Error saving URL in database' });
  }

  res.status(200).json({ short: `https://iny.one/${slug}` });
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