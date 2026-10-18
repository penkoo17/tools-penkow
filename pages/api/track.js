import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const body = req.body || {};
    const logId = Date.now().toString() + Math.random().toString(36).substring(7);
    
    // Simpan log ke Database Vercel KV
    await kv.set(`log_${logId}`, { ...body, id_waktu: logId });
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal simpan log' });
  }
}