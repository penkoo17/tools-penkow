import { useState } from "react";

export default function LinkForm({ onResult, onError }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      const r = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiktokUrl: url }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Gagal");
      onResult(data.short);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://tiktok.com/@user/video/..."
        style={{ flex: 1 }}
      />
      <button disabled={loading}>{loading ? "..." : "Buat Link"}</button>
    </form>
  );
}
