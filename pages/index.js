import { useState } from 'react';
import LinkForm from '../components/LinkForm.js';
import Layout from '../components/layout.js';
import Head from 'next/head';

export default function Home() {
  const [short, setShort] = useState('');
  const [err, setErr] = useState('');

  return (
    <>
      <Head>
        <title>PENKO</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Shortlink TikTok." />
      </Head>

      <Layout>
        <div className="home">
          <div className="home-grid">
            <h1 className="brand-hero">PENKO</h1>

            <section className="card">
              <div className="card-bar" aria-hidden="true">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>

              <div className="card-body">
                <LinkForm
                  onResult={s => {
                    setShort(s);
                    setErr('');
                  }}
                  onError={e => setErr(e)}
                />

                <div aria-live="polite">
                  {err && <p className="alert-error">{err}</p>}

                  {short && (
                    <div className="result">
                      <span className="result-icon" aria-hidden="true">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2.25 6.25L4.75 8.75L9.75 3.25"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <a
                        className="result-link"
                        href={short}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {short}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
}
