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
      </Head>
      <div style={{ padding: '20px', backgroundColor: '#f2f2f7', color: '#000', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>Dashboard</h1>
          <button onClick={load} style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '600', borderRadius: '10px', border: 'none', backgroundColor: '#007aff', color: '#fff', cursor: 'pointer' }}>
            {loading ? 'Memuat...' : 'Refresh'}
          </button>
        </div>
        <LogTable logs={logs} />
      </div>
    </>
  );
}