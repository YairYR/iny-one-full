import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { url, utm } = req.body;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  // Normalizar URL
  let fullUrl = url.trim();
  if (!/^https?:\/\//i.test(fullUrl)) {
    fullUrl = 'https://' + fullUrl;
  }

  // Agregar parámetros UTM si existen
  const params = [];
  if (utm?.source) params.push(`utm_source=${utm.source}`);
  if (utm?.medium) params.push(`utm_medium=${utm.medium}`);
  if (utm?.campaign) params.push(`utm_campaign=${utm.campaign}`);

  if (params.length > 0) {
    const connector = fullUrl.includes('?') ? '&' : '?';
    fullUrl += connector + params.join('&');
  }

  const slug = nanoid(6);

  const { error } = await supabase
    .from('short_links')
    .insert([
      {
        slug,
        destination: fullUrl,
        utm_source: utm?.source ?? null,
        utm_medium: utm?.medium ?? null,
        utm_campaign: utm?.campaign ?? null,
        user_id: null, // pública por ahora
      },
    ]);

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ error: 'Error saving URL in database' });
  }

  res.status(200).json({ short: `https://iny.one/${slug}` });
}

