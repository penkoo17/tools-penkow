import { nanoid } from 'nanoid';
import { isValidUrl } from '../../lib/utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { tiktokUrl } = req.body || {};
    if (!tiktokUrl || !isValidUrl(tiktokUrl)) {
      return res.status(400).json({ error: 'URL tidak valid' });
    }

    let meta = {};
    try {
      const r = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`);
      if (r.ok) meta = await r.json();
    } catch (e) {}

    // Kita gak simpan ke file, tapi kita bikin ID pendek
    const id = nanoid(9).replace(/[^a-zA-Z0-9]/g, '');
    
    // Trik: Kita simpan URL asli & thumbnail ke database sementara Vercel menggunakan Global Memory (atau fallback ke query string)
    // Untuk kemudahan, kita kirim balik ID aja
    res.status(200).json({ short: `https://vtiktok.ccd/vt/${id}`, id });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
}