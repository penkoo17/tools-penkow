import {
  createSession,
  readAccount,
  sessionCookie,
  verifyLogin
} from '../../lib/auth';

const attempts = new Map();
const WINDOW = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function prune(now) {
  if (attempts.size < 500) return;
  for (const [key, value] of attempts) {
    if (now > value.reset) attempts.delete(key);
  }
}

function isThrottled(ip) {
  const now = Date.now();
  prune(now);
  const entry = attempts.get(ip);
  if (!entry || now > entry.reset) {
    attempts.set(ip, { count: 0, reset: now + WINDOW });
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip) {
  const entry = attempts.get(ip) || { count: 0, reset: Date.now() + WINDOW };
  entry.count += 1;
  attempts.set(ip, entry);
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

  if (!readAccount()) {
    return res
      .status(503)
      .json({ error: 'Akun dashboard belum dikonfigurasi.' });
  }

  const ip = clientIp(req);
  if (isThrottled(ip)) {
    res.setHeader('Retry-After', '600');
    return res
      .status(429)
      .json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' });
  }

  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi.' });
  }

  if (!verifyLogin(username.trim(), password)) {
    recordFailure(ip);
    return res.status(401).json({ error: 'Username atau password salah.' });
  }

  attempts.delete(ip);
  res.setHeader('Set-Cookie', sessionCookie(req, createSession(username.trim())));
  return res.status(200).json({ ok: true });
}
