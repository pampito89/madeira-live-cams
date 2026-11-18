import type { NextApiRequest, NextApiResponse } from 'next';
import { getLocationStatusFeed } from '../../lib/locationStatusServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end(); }
  res.setHeader('X-Robots-Tag', 'noindex');
  try {
    const feed = await getLocationStatusFeed();
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=60');
    return res.status(200).json(feed);
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ checkedAt: new Date().toISOString(), statuses: {} });
  }
}
