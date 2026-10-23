import type { NextApiRequest, NextApiResponse } from 'next';
import { isSupportedLocale } from '../../lib/i18n/config';
import { getEventFeed } from '../../lib/events/feed';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method not allowed' }); }
 const locale = typeof req.query.locale === 'string' ? req.query.locale : 'en';
 if (!isSupportedLocale(locale)) return res.status(400).json({ error: 'Unsupported language' });
 res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60');
 try { return res.status(200).json(await getEventFeed(locale)); } catch { return res.status(503).json({ error: 'Events temporarily unavailable' }); }
}
