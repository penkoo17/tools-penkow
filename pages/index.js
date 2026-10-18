import { useState } from 'react';
import LinkForm from '../components/LinkForm';
import Head from 'next/head';

export default function Home() {
  const [short, setShort] = useState('');
  const [err, setErr] = useState('');

  return (
    <>
      <Head>
        <title>PENKO Tools</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <div style={{ 
        backgroundColor: '#f2f2f7',
        color: '#000', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '34px', fontWeight: '800', marginBottom: '8px', textAlign: 'center' }}>
            PENKO Tools
          </h1>
          <p style={{ color: '#8e8e93', fontSize: '15px', marginBottom: '32px', textAlign: 'center' }}>
            Tempel URL TikTok, dapatkan shortlink.
          </p>
          
          <LinkForm onResult={(s) => { setShort(s); setErr(''); }} onError={(e) => setErr(e)} />
          
          {err && <p style={{ color: '#ff3b30', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>{err}</p>}

          {short && (
            <div style={{ marginTop: '24px', padding: '20px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <p style={{ color: '#8e8e93', fontSize: '13px', marginBottom: '8px' }}>Shortlink Berhasil Dibuat</p>
              <a href={short} target="_blank" rel="noreferrer" style={{ color: '#007aff', fontSize: '18px', fontWeight: '700', textDecoration: 'none', wordBreak: 'break-all' }}>
                {short}
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}