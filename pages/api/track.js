import { appendLog } from '../../lib/store';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const body = req.body || {};

  // Fallback Server-side IP Geo (Pakai API IPWHO yang stabil)
  if (body.ip && !body.ip.startsWith('192.168') && !body.ip.startsWith('127.')) {
    try {
      const geoRes = await fetch(`https://ipwho.is/${body.ip}`);
      const geo = await geoRes.json();
      if (geo.success) {
        body.ipGeo = {
          city: geo.city,
          country: geo.country,
          lat: geo.latitude,
          lng: geo.longitude,
          isp: geo.connection?.isp
        };
      }
    } catch (e) {}
  }

  // Jika client berhasil mendapatkan IP Geo sendiri, gunakan itu
  if (body.clientIpGeo && !body.ipGeo) {
    body.ipGeo = body.clientIpGeo;
  }

  appendLog(body);
  res.json({ ok: true });
}