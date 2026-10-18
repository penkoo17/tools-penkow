import { useState } from 'react';

export default function LinkForm({ onResult, onError }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      const r = await fetch('/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiktokUrl: url })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Gagal');
      onResult(data.short);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="form-stack">
      <label className="sr-only" htmlFor="tiktok-url">
        URL TikTok
      </label>
      <input
        id="tiktok-url"
        className="text-input"
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="https://vt.tiktok.com/..."
      />

      <button
        type="submit"
        className="btn"
        disabled={loading}
        aria-busy={loading}
        aria-label={loading ? 'Memproses' : 'Buat Link'}
      >
        {loading ? '…' : 'Buat Link'}
      </button>
    </form>
  );
}
