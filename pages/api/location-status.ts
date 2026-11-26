import type { NextApiRequest, NextApiResponse } from 'next';
import { getLocationStatusFeed } from '../../lib/locationStatusServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end(); }
  res.setHeader('X-Robots-Tag', 'noindex');
  try {
    const feed = await getLocationStatusFeed();
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=43200, stale-while-revalidate=43200');
    res.setHeader('CDN-Cache-Control', 'public, s-maxage=43200, stale-while-revalidate=43200');
    return res.status(200).json(feed);
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ checkedAt: new Date().toISOString(), statuses: {} });
  }
}
