import {
  authenticate,
  createSession,
  readAccounts,
  sessionCookie
} from '../../lib/auth';

const attempts = new Map();
const WINDOW = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function throttleKey(req, username) {
  return `${clientIp(req)}|${String(username || '').trim().toLowerCase()}`;
}

function prune(now) {
  if (attempts.size < 500) return;
  for (const [key, value] of attempts) {
    if (now > value.reset) attempts.delete(key);
  }
}

function isThrottled(key) {
  const now = Date.now();
  prune(now);
  const entry = attempts.get(key);
  if (!entry || now > entry.reset) {
    attempts.set(key, { count: 0, reset: now + WINDOW });
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key) {
  const entry = attempts.get(key) || { count: 0, reset: Date.now() + WINDOW };
  entry.count += 1;
  attempts.set(key, entry);
}

function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch (e) {
    return false;
  }
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: 'Permintaan ditolak.' });
  }

  if (!readAccounts().length) {
    return res
      .status(503)
      .json({ error: 'Akun dashboard belum dikonfigurasi.' });
  }

  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi.' });
  }

  const key = throttleKey(req, username);
  if (isThrottled(key)) {
    res.setHeader('Retry-After', '600');
    return res
      .status(429)
      .json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' });
  }

  const account = authenticate(username, password);
  if (!account) {
    recordFailure(key);
    return res.status(401).json({ error: 'Username atau password salah.' });
  }

  attempts.delete(key);
  res.setHeader('Set-Cookie', sessionCookie(req, createSession(account.user)));
  return res.status(200).json({ ok: true, user: account.user });
}
