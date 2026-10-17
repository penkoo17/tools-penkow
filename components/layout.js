import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <nav style={{ padding: '12px 24px', borderBottom: '1px solid #333', display: 'flex', gap: 16 }}>
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}