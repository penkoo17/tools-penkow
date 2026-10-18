import { useEffect, useState } from 'react';
import LogTable from '../components/logtable';
import Layout from '../components/layout';
import Head from 'next/head';

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.3 6.7A5.5 5.5 0 1 0 13 10.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M13.5 2.7V7H9.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

  useEffect(() => {
    load();
  }, []);

  const gpsCount = logs.filter(log => {
    const lat = Number(log.gps?.lat);
    const lng = Number(log.gps?.lng);
    return Number.isFinite(lat) && Number.isFinite(lng);
  }).length;

  const uniqueIps = new Set(
    logs
      .map(log => log.ip || log.clientIpGeo?.ip || log.ipGeo?.ip)
      .filter(Boolean)
  ).size;

  return (
    <>
      <Head>
        <title>Dashboard — PENKO</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Log shortlink PENKO." />
      </Head>

      <Layout>
        <div className="dashboard">
          <header className="dash-head">
            <h1 className="dash-title">Dashboard</h1>

            <button
              type="button"
              onClick={load}
              disabled={loading}
              aria-busy={loading}
              aria-label="Refresh"
              title="Refresh"
              className={`icon-btn${loading ? ' is-spinning' : ''}`}
            >
              <RefreshIcon />
            </button>
          </header>

          <section className="stats" aria-label="Ringkasan">
            <div className="stat">
              <span className="stat-label">Log</span>
              <strong className="stat-value">{logs.length}</strong>
            </div>
            <div className="stat">
              <span className="stat-label">GPS</span>
              <strong className="stat-value">{gpsCount}</strong>
            </div>
            <div className="stat">
              <span className="stat-label">IP</span>
              <strong className="stat-value">{uniqueIps}</strong>
            </div>
          </section>

          <section>
            <div className="section-head">
              <h2 className="section-title">Log</h2>
              <span className="section-count">{logs.length}</span>
            </div>

            <LogTable logs={logs} loading={loading} />
          </section>
        </div>
      </Layout>
    </>
  );
}
