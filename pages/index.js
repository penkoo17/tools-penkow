import { useState } from 'react';
import LinkForm from '../components/LinkForm.js'; // Tambah .js
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
        backgroundColor: '#f2f2f7', // Latar belakang abu-abu bersih khas iOS
        color: '#000', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px', marginBottom: '8px', textAlign: 'center', color: '#000' }}>
            PENKO Tools
          </h1>
          <p style={{ color: '#8e8e93', fontSize: '15px', fontWeight: '500', marginBottom: '32px', textAlign: 'center' }}>
            Tempel URL TikTok, dapatkan shortlink.
          </p>
          
          <LinkForm onResult={(s) => { setShort(s); setErr(''); }} onError={(e) => setErr(e)} />
          
          {err && (
            <p style={{ color: '#ff3b30', fontSize: '14px', fontWeight: '600', marginTop: '16px', textAlign: 'center', padding: '12px', background: 'rgba(255,59,48,0.1)', borderRadius: '10px' }}>
              {err}
            </p>
          )}

          {short && (
            <div style={{ 
              marginTop: '24px', 
              padding: '24px', 
              background: '#ffffff', 
              borderRadius: '16px', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)', // Bayangan halus iOS
              textAlign: 'center',
              border: '1px solid #e5e5ea'
            }}>
              <p style={{ color: '#8e8e93', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                Shortlink Berhasil Dibuat
              </p>
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