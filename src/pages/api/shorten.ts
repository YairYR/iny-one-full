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
  let fullUrl = url.trim();
  if (!/^https?:\/\//i.test(fullUrl)) {
    fullUrl = 'https://' + fullUrl;
  }

  const urlInfo = tldts.parse(fullUrl);
  if(urlInfo.domain === null || urlInfo.isIp || ["iny.one", "localhost"].includes(urlInfo.domain)) {
    console.log('❌ La URL ingresada no es válida:', fullUrl)
    return res.status(500).end();
  }

  const urlBanned = await getBlockUrl(urlInfo.domain);

  if(urlBanned.error) {
    console.error(urlBanned.error);
    return res.status(500).end();
  }

  if(urlBanned.data !== null && urlBanned.data === false) {
    console.log('❗ El dominio de la URL ingresada está baneada:', fullUrl);
    return res.status(500).end();
  }

  const sanitize = (value: string) =>
      value.replace(/[^a-zA-Z0-9-_]/g, '')

  // Agregar parámetros UTM si existen
  const params = [];
  if (utm?.source) params.push(`utm_source=${sanitize(utm.source.trim())}`);
  if (utm?.medium) params.push(`utm_medium=${sanitize(utm.medium.trim())}`);
  if (utm?.campaign) params.push(`utm_campaign=${sanitize(utm.campaign.trim())}`);

  if (params.length > 0) {
    const connector = fullUrl.includes('?') ? '&' : '?';
    fullUrl += connector + params.join('&');
  }

  const slug = nanoid(6);
  const { error } = await addShortenUrl(slug, fullUrl, utm, urlInfo.domain, {
    ip,
    countryCode,
  });

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ error: 'Error saving URL in database' });
  }

  res.status(200).json({ short: `https://iny.one/${slug}` });
}
