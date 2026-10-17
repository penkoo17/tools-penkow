import { getLink } from '../../../lib/store';

export default function handler(req, res) {
  const { id } = req.query;
  const link = getLink(id);
  if (!link) return res.status(404).json({ error: 'not found' });
  res.json(link);
}