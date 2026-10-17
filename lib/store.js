import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const LOG_FILE = path.join(DATA_DIR, 'logs.json');
const LINK_FILE = path.join(DATA_DIR, 'links.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function safeRead(file, fallback) {
  try {
    ensureDir();
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(fallback));
      return fallback;
    }
    const raw = fs.readFileSync(file, 'utf8').trim();
    if (!raw) {
      fs.writeFileSync(file, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    try { fs.renameSync(file, `${file}.bak.${Date.now()}`); } catch (_) {}
    fs.writeFileSync(file, JSON.stringify(fallback));
    return fallback;
  }
}

export const readLogs  = () => safeRead(LOG_FILE, []);
export const readLinks = () => safeRead(LINK_FILE, {});

export const writeLogs  = (v) => fs.writeFileSync(LOG_FILE, JSON.stringify(v, null, 2));
export const writeLinks = (v) => fs.writeFileSync(LINK_FILE, JSON.stringify(v, null, 2));

export const appendLog = (entry) => {
  const logs = readLogs();
  logs.push({ ...entry, received: Date.now() });
  writeLogs(logs);
  return logs.length;
};

export const saveLink = (id, payload) => {
  const links = readLinks();
  links[id] = payload;
  writeLinks(links);
};

export const getLink = (id) => readLinks()[id] || null;