import { nanoid } from 'nanoid';
import { NextApiRequest, NextApiResponse } from "next";

// Configura tus datos de GitHub
const GITHUB_USERNAME = 'YairYR';
const REPO_NAME = 'iny-one-full';
const FILE_PATH = 'data/urls.json';
const BRANCH = 'main';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  if (!url) return res.status(400).json({ error: 'URL faltante' });

  // UTM handling
  let fullUrl = url.trim();
  if (!/^https?:\/\//i.test(fullUrl)) {
    fullUrl = 'https://' + fullUrl;
  }

  const params = [];
  if (utm?.source) params.push(`utm_source=${utm.source}`);
  if (utm?.medium) params.push(`utm_medium=${utm.medium}`);
  if (utm?.campaign) params.push(`utm_campaign=${utm.campaign}`);

  if (params.length > 0) {
    const connector = fullUrl.includes('?') ? '&' : '?';
    fullUrl += connector + params.join('&');
  }

  const id = nanoid(6);
  const shortUrl = `https://iny.one/${id}`;

  try {
    // Obtener el archivo actual
    const getRes = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    const { content, sha } = await getRes.json();
    const decoded = Buffer.from(content, 'base64').toString('utf-8');
    const urls = JSON.parse(decoded);

    // Agregar nuevo ID
    urls[id] = fullUrl;

    // Codificar y subir
    const updatedContent = Buffer.from(JSON.stringify(urls, null, 2)).toString('base64');

    await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `Add shortened URL for ${id}`,
        content: updatedContent,
        sha,
        branch: BRANCH,
      }),
    });

    res.status(200).json({ short: shortUrl });
  } catch (err) {
    console.error('Error al guardar en GitHub:', err);
    res.status(500).json({ error: 'Error al guardar la URL' });
  }
}
