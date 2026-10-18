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
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="https://vt.tiktok.com/..."
        style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px', border: '1px solid #e5e5ea', backgroundColor: '#ffffff', color: '#000', outline: 'none' }}
      />
      <button 
        disabled={loading} 
        style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', border: 'none', backgroundColor: loading ? '#e5e5ea' : '#007aff', color: loading ? '#8e8e93' : '#ffffff', cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Memproses...' : 'Buat Link'}
      </button>
    </form>
  );
}