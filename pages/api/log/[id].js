import { readLogs } from '../../../lib/store';

export default function handler(req, res) {
  const { id } = req.query;
  const logs = readLogs().filter(l => l.id === id);
  res.json(logs);
}