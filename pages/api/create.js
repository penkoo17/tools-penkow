import { isValidUrl } from '../../lib/utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const { tiktokUrl } = req.body || {};
    if (!tiktokUrl || !isValidUrl(tiktokUrl)) {
      return res.status(400).json({ error: 'URL tidak valid' });
    }

    // Ubah URL asli jadi Base64 (biar aman & pendek)
    const encodedUrl = Buffer.from(tiktokUrl).toString('base64url');
    const shortUrl = `https://vtiktok.ccd/${encodedUrl}`;
    
    res.status(200).json({ short: shortUrl });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
}