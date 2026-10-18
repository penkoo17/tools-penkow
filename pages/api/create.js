import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";
import { isValidUrl } from "../../lib/utils";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { tiktokUrl } = req.body || {};
    if (!tiktokUrl || !isValidUrl(tiktokUrl)) {
      return res.status(400).json({ error: "URL tidak valid" });
    }

    let meta = {};
    try {
      const r = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`,
      );
      if (r.ok) meta = await r.json();
    } catch (e) {}

    // Buat ID acak 7 huruf
    const id = nanoid(7);

    // Simpan URL asli ke Database Vercel KV
    await kv.set(id, { url: tiktokUrl, meta });

    const shortUrl = `https://vtiktok.cc.cd/${id}`;
    // Hapus /vt, dan pastikan domainnya .cc.cd

    res.status(200).json({ short: shortUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
}
