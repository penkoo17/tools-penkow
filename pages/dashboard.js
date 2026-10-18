import { useEffect, useState } from 'react';
import LogTable from '../components/LogTable';
import Head from 'next/head';

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/log');
      const data = await r.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <>
      <Head>
        <title>Dashboard - PENKO Tools</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f2f2f7', 
        color: '#000', 
        minHeight: '100vh', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>Dashboard</h1>
          <button 
            onClick={load} 
            style={{ 
              padding: '8px 16px', 
              fontSize: '14px', 
              fontWeight: '600', 
              borderRadius: '10px', 
              border: 'none', 
              backgroundColor: '#007aff', 
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,122,255,0.3)'
            }}
          >
            {loading ? 'Memuat...' : 'Refresh'}
          </button>
        </div>
        <LogTable logs={logs} />
      </div>
    </>
  );
}