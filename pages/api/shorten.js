import { nanoid } from 'nanoid';

let urlDatabase = {};

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { url, utm } = req.body;

    let fullUrl = url;
    const params = [];
    if (utm?.source) params.push(`utm_source=${utm.source}`);
    if (utm?.medium) params.push(`utm_medium=${utm.medium}`);
    if (utm?.campaign) params.push(`utm_campaign=${utm.campaign}`);

    if (params.length > 0) {
      fullUrl += (url.includes('?') ? '&' : '?') + params.join('&');
    }

    const id = nanoid(6);
    urlDatabase[id] = { fullUrl, clicks: 0 };

    res.status(200).json({ short: `https://iny.one/${id}` });
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}

export { urlDatabase };
