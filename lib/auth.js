import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const SESSION_COOKIE = 'penko_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const DATA_DIR = path.join(process.cwd(), 'data');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
const LEGACY_FILE = path.join(DATA_DIR, 'auth.json');

function digest(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest();
}

function safeEqual(a, b) {
  return crypto.timingSafeEqual(digest(a), digest(b));
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return null;
  }
}

function normalize(entry) {
  if (!entry || typeof entry.user !== 'string' || !entry.user) return null;
  if (typeof entry.pass === 'string' && entry.pass) {
    return { user: entry.user, pass: entry.pass };
  }
  if (typeof entry.salt === 'string' && typeof entry.hash === 'string') {
    return { user: entry.user, salt: entry.salt, hash: entry.hash };
  }
  return null;
}

function pickList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.accounts)) return raw.accounts;
  return [];
}

// Akun yang dititipkan lewat environment (dipakai di Vercel).
function envAccounts() {
  const list = [];

  const raw = process.env.DASHBOARD_ACCOUNTS;
  if (raw) {
    try {
      for (const row of pickList(JSON.parse(raw))) {
        const account = normalize(row);
        if (account) list.push(account);
      }
    } catch (e) {}
  }

  if (process.env.DASHBOARD_PASS) {
    list.push({
      user: process.env.DASHBOARD_USER || 'penko',
      pass: process.env.DASHBOARD_PASS
    });
  }

  return list;
}

function accountsFile() {
  const raw = readJson(ACCOUNTS_FILE);
  if (raw === null) return null;
  return {
    accounts: pickList(raw).map(normalize).filter(Boolean),
    secret: raw && typeof raw.secret === 'string' ? raw.secret : ''
  };
}

export function readAccounts() {
  const fromEnv = envAccounts();
  if (fromEnv.length) return fromEnv;

  const file = accountsFile();
  if (file) return file.accounts;

  // Kompatibilitas: akun lama yang masih tersimpan sebagai satu akun.
  const legacy = normalize(readJson(LEGACY_FILE));
  return legacy ? [legacy] : [];
}

export function findAccount(username) {
  const wanted = String(username || '').trim().toLowerCase();
  return (
    readAccounts().find(account => account.user.toLowerCase() === wanted) || null
  );
}

export function authenticate(username, password) {
  const account = findAccount(username);
  if (!account) return null;

  if (account.pass !== undefined) {
    return safeEqual(password || '', account.pass) ? account : null;
  }

  const attempt = crypto.scryptSync(String(password || ''), account.salt, 64);
  const expected = Buffer.from(account.hash, 'hex');
  const ok =
    attempt.length === expected.length && crypto.timingSafeEqual(attempt, expected);

  return ok ? account : null;
}

function sessionSecret(accounts) {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;

  // Kunci tetap dari file akun supaya menambah/menghapus satu akun
  // tidak memaksa semua orang login ulang.
  const file = accountsFile();
  if (file && file.secret) return file.secret;

  const legacy = normalize(readJson(LEGACY_FILE));
  if (!file && legacy) return legacy.hash || legacy.pass || '';

  return accounts.map(account => account.hash || account.pass || account.user).join('|');
}

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createSession(username) {
  const secret = sessionSecret(readAccounts());
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + SESSION_MAX_AGE * 1000 })
  ).toString('base64url');

  return `${payload}.${sign(payload, secret)}`;
}

export function readSession(token) {
  if (!token || typeof token !== 'string') return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const accounts = readAccounts();
  if (!accounts.length) return null;
  if (!safeEqual(signature, sign(payload, sessionSecret(accounts)))) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data || typeof data.u !== 'string') return null;
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;

    // Akun yang sudah dihapus tidak boleh memakai sesi lamanya.
    const stillExists = accounts.some(
      account => account.user.toLowerCase() === data.u.toLowerCase()
    );
    if (!stillExists) return null;

    return { username: data.u, expires: data.exp };
  } catch (e) {
    return null;
  }
}

function isSecure(req) {
  return (
    req.headers['x-forwarded-proto'] === 'https' ||
    Boolean(req.connection && req.connection.encrypted)
  );
}

export function sessionCookie(req, token) {
  const secure = isSecure(req) ? '; Secure' : '';
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}${secure}`;
}

export function clearSessionCookie(req) {
  const secure = isSecure(req) ? '; Secure' : '';
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
