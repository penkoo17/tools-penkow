import { kv } from '@vercel/kv';
import { readSession, SESSION_COOKIE } from '../../lib/auth';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (!readSession(req.cookies[SESSION_COOKIE])) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Ambil semua key yang ada di database
    const keys = await kv.keys('log_*');
    
    // Ambil datanya satu per satu
    const logs = await Promise.all(
      keys.map(async (key) => await kv.get(key))
    );
    
    // Urutkan dari yang paling baru
    logs.sort((a, b) => (b.ts || 0) - (a.ts || 0));
    
    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
}