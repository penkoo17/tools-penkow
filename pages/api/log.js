import { readLogs } from '../../lib/store';

export default function handler(req, res) {
  res.json(readLogs());
}