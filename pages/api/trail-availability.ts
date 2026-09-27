import type { NextApiRequest, NextApiResponse } from 'next';
import { getTrails, getWeek } from '../../lib/simplifica';
import { addDays, BOOKING_URL, madeiraDate, validDate } from '../../lib/trailAvailability';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const { route, start } = req.query;
  const today = madeiraDate();
  if (typeof route !== 'string' || !/^\d{1,6}$/.test(route) || typeof start !== 'string' || !validDate(start) || start < today || start > addDays(today, 90)) {
    return res.status(400).json({ error: 'invalid_search' });
  }
  try {
    const trails = await getTrails();
    if (!trails.some(trail => trail.id === Number(route))) return res.status(400).json({ error: 'unknown_route' });
    const days = await getWeek(Number(route), start);
    return res.status(days.every(day => day.error) ? 503 : 200).json({ days, source: BOOKING_URL });
  } catch {
    return res.status(503).json({ error: 'source_unavailable' });
  }
}
