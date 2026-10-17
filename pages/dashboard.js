import { useEffect, useState } from 'react';
import LogTable from '../components/LogTable.js';

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch('/api/log');
    const data = await r.json();
    setLogs(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <button onClick={load} style={{ marginBottom: 12 }}>Refresh</button>
      {loading ? <p>Memuat…</p> : <LogTable logs={logs} />}
    </div>
  );
}