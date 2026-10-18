import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const SESSION_COOKIE = 'penko_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const ACCOUNT_FILE = path.join(process.cwd(), 'data', 'auth.json');

function digest(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest();
}

function safeEqual(a, b) {
  return crypto.timingSafeEqual(digest(a), digest(b));
}

// Env vars win, so a deployment can keep credentials out of the repo.
export function readAccount() {
  const pass = process.env.DASHBOARD_PASS;
  if (pass) {
    return { user: process.env.DASHBOARD_USER || 'penko', pass };
  }

  try {
    const raw = JSON.parse(fs.readFileSync(ACCOUNT_FILE, 'utf8'));
    if (raw && raw.user && raw.salt && raw.hash) {
      return { user: raw.user, salt: raw.salt, hash: raw.hash };
    }
  } catch (e) {}

  return null;
}

export function verifyLogin(username, password) {
  const account = readAccount();
  if (!account) return false;
  if (!safeEqual(username || '', account.user)) return false;

  if (account.pass !== undefined) {
    return safeEqual(password || '', account.pass);
  }

  const attempt = crypto.scryptSync(String(password || ''), account.salt, 64);
  const expected = Buffer.from(account.hash, 'hex');
  return attempt.length === expected.length && crypto.timingSafeEqual(attempt, expected);
}

function sessionSecret(account) {
  return process.env.AUTH_SECRET || (account && (account.pass || account.hash)) || '';
}

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createSession(username) {
  const secret = sessionSecret(readAccount());
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + SESSION_MAX_AGE * 1000 })
  ).toString('base64url');

  return `${payload}.${sign(payload, secret)}`;
}

export function readSession(token) {
  if (!token || typeof token !== 'string') return null;

  const [payload, signature] = token.split('.');
  const account = readAccount();
  if (!payload || !signature || !account) return null;
  if (!safeEqual(signature, sign(payload, sessionSecret(account)))) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data || data.u !== account.user) return null;
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
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
