import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { readSession, SESSION_COOKIE } from '../lib/auth';

export default function Login({ next }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Gagal masuk.');
        setLoading(false);
        return;
      }

      router.replace(next);
    } catch (err) {
      setError('Tidak bisa terhubung. Coba lagi.');
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Masuk</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </Head>

      <main className="login">
        <div className="login-inner">
          <h1 className="login-title">Dashboard</h1>
          <p className="login-sub">Masuk untuk melihat log.</p>

          <form className="login-form" onSubmit={submit} noValidate>
            <div className="field-group">
              <div className="field-row">
                <label className="sr-only" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  className="login-input"
                  type="text"
                  name="username"
                  placeholder="Username"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={username}
                  onChange={event => setUsername(event.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="field-row">
                <label className="sr-only" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  className="login-input"
                  type="password"
                  name="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div aria-live="polite">
              {error && (
                <p className="login-error" role="alert">
                  {error}
                </p>
              )}
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Memeriksa…' : 'Masuk'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export function getServerSideProps({ req, query }) {
  if (readSession(req.cookies[SESSION_COOKIE])) {
    return { redirect: { destination: '/dashboard', permanent: false } };
  }

  const requested = typeof query.next === 'string' ? query.next : '';
  const next =
    requested.startsWith('/') && !requested.startsWith('//')
      ? requested
      : '/dashboard';

  return { props: { next } };
}
