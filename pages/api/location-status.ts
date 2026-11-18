import type { NextApiRequest, NextApiResponse } from 'next';
import { IFCN_STATUS_URL, parseIfcnStatuses, type LocationStatusFeed } from '../../lib/locationStatus';
let cached: LocationStatusFeed | undefined;
let pending: Promise<LocationStatusFeed> | undefined;
let retryAt = 0;
async function refresh(): Promise<LocationStatusFeed> {
  const response = await fetch(IFCN_STATUS_URL, { signal: AbortSignal.timeout(5000), headers: { Accept: 'text/html' } });
  if (!response.ok) throw new Error('IFCN unavailable');
  const html = await response.text();
  if (html.length > 2_000_000) throw new Error('Unexpected IFCN response');
  const feed = parseIfcnStatuses(html);
  cached = feed;
  return feed;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end(); }
  res.setHeader('X-Robots-Tag', 'noindex');
  try {
    if (!cached || Date.now() - Date.parse(cached.checkedAt) >= 60_000) {
      if (Date.now() < retryAt) throw new Error('IFCN retry pending');
      pending ??= refresh().finally(() => { pending = undefined; });
      await pending;
    }
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=60');
    return res.status(200).json(cached);
  } catch {
    retryAt = Date.now() + 30_000;
    res.setHeader('Cache-Control', 'no-store');
    // Failed requests never refresh old timestamps or keep showing an old green status.
    return res.status(503).json({ checkedAt: new Date().toISOString(), statuses: {} });
  }
}
