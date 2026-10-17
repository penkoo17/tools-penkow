import { nanoid } from 'nanoid';
import { saveLink } from '../../lib/store';
import { isValidUrl } from '../../lib/utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { tiktokUrl } = req.body || {};

  if (!tiktokUrl || !isValidUrl(tiktokUrl)) {
    return res.status(400).json({ error: 'URL tidak valid' });
  }

  let meta = {};
  try {
    const r = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`);
    if (r.ok) meta = await r.json();
  } catch (e) {}

  const id = nanoid(9).replace(/[^a-zA-Z0-9]/g, '');
  saveLink(id, { url: tiktokUrl, meta, created: Date.now() });

  res.json({
    short: `https://vtiktok.ccd/vt/${id}`,
    id
  });
}