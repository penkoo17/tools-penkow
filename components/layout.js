import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();
  const isHome = router.pathname === '/';
  const isDashboard = router.pathname === '/dashboard';

  return (
    <div className="app">
      <header className="app-nav">
        <div className="nav-inner">
          <Link href="/" className="brand">
            PENKO
          </Link>

          <nav className="nav-links" aria-label="Menu">
            <Link
              href="/"
              className={`nav-link${isHome ? ' is-active' : ''}`}
              aria-current={isHome ? 'page' : undefined}
            >
              Link
            </Link>
            <Link
              href="/dashboard"
              className={`nav-link${isDashboard ? ' is-active' : ''}`}
              aria-current={isDashboard ? 'page' : undefined}
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="app-main">{children}</main>

      <footer className="dev-credit">developer : penko</footer>
    </div>
  );
}
