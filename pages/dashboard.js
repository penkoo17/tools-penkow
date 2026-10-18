import { useEffect, useState } from 'react';

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
    <div style={{ padding: 24, color: '#fff', backgroundColor: '#111', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1>Dashboard Logs</h1>
      <button onClick={load} style={{ marginBottom: 16, padding: '8px 16px', cursor: 'pointer' }}>
        {loading ? 'Memuat...' : 'Refresh Data'}
      </button>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #333' }}>
          <thead>
            <tr style={{ backgroundColor: '#222' }}>
              <th style={{ padding: 10, border: '1px solid #333' }}>Waktu</th>
              <th style={{ padding: 10, border: '1px solid #333' }}>Tipe</th>
              <th style={{ padding: 10, border: '1px solid #333' }}>IP</th>
              <th style={{ padding: 10, border: '1px solid #333' }}>Lokasi</th>
              <th style={{ padding: 10, border: '1px solid #333' }}>Target URL</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>Belum ada data log.</td></tr>
            ) : (
              logs.map((l, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: 10, border: '1px solid #333', fontSize: 12 }}>
                    {new Date(l.ts).toLocaleString()}
                  </td>
                  <td style={{ padding: 10, border: '1px solid #333' }}>
                    <span style={{ padding: '2px 6px', background: l.gps ? '#0d47a1' : '#333', borderRadius: 4, fontSize: 12 }}>
                      {l.gps ? 'GPS Akurat' : 'IP Only'}
                    </span>
                  </td>
                  <td style={{ padding: 10, border: '1px solid #333', fontFamily: 'monospace' }}>{l.ip || '-'}</td>
                  <td style={{ padding: 10, border: '1px solid #333' }}>
                    {l.gps ? `${l.gps.lat.toFixed(5)}, ${l.gps.lng.toFixed(5)}` : '-'}
                  </td>
                  <td style={{ padding: 10, border: '1px solid #333', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {l.targetUrl || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}