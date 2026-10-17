import { useState } from 'react';
import LinkForm from '../components/LinkForm.js';

export default function Home() {
  const [short, setShort] = useState('');
  const [err, setErr] = useState('');

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1>PENKO Tools</h1>
      <p style={{ opacity: 0.7 }}>Tempel URL TikTok, dapatkan shortlink.</p>
      <LinkForm onResult={(s) => { setShort(s); setErr(''); }} onError={(e) => setErr(e)} />
      {err && <p style={{ color: '#f66' }}>{err}</p>}
      {short && (
        <div style={{ marginTop: 16, padding: 12, background: '#1c1c1c', borderRadius: 8 }}>
          <p>Shortlink:</p>
          <a href={short} target="_blank" rel="noreferrer">{short}</a>
        </div>
      )}
    </div>
  );
}