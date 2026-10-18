import { readLogs } from '../../../lib/store';
import { readSession, SESSION_COOKIE } from '../../../lib/auth';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (!readSession(req.cookies[SESSION_COOKIE])) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  const logs = readLogs().filter(l => l.id === id);
  res.json(logs);
}