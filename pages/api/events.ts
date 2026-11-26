import type { NextApiRequest, NextApiResponse } from 'next';
import { isSupportedLocale } from '../../lib/i18n/config';
import { getEventFeed } from '../../lib/events/feed';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 res.setHeader('X-Robots-Tag', 'noindex');
 if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
 const locale = typeof req.query.locale === 'string' ? req.query.locale : 'en';
 if (!isSupportedLocale(locale)) return res.status(400).json({ error: 'Unsupported language' });
 try {
  const feed = await getEventFeed(locale);
  if (feed.sources.every(source => source.status === 'unavailable')) throw new Error('All event sources unavailable');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=43200, stale-while-revalidate=86400');
  res.setHeader('CDN-Cache-Control', 'public, s-maxage=43200, stale-while-revalidate=86400');
  return res.status(200).json(feed);
 } catch {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(503).json({ error: 'Events temporarily unavailable' });
 }
}
