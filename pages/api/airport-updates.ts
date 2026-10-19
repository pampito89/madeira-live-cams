import type { NextApiRequest, NextApiResponse } from 'next';
import { parseAirportNews, parseAirportWarnings, type AirportUpdates } from '../../lib/airportUpdates';
let cache: AirportUpdates | undefined;
let pending: Promise<AirportUpdates> | undefined;
async function read(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'MadeiraLiveCams/1.0 (+https://madeiralivecams.com)' } });
  if (!response.ok) throw new Error('Source unavailable');
  const text = await response.text();
  if (text.length > 2_000_000) throw new Error('Response too large');
  return text;
}
async function collect(): Promise<AirportUpdates> {
  const [news, warnings] = await Promise.allSettled([
    read('https://pt.newsroom.ana.pt/feed/').then(text => parseAirportNews(text)),
    read('https://api.ipma.pt/open-data/forecast/warnings/warnings_www.json').then(text => parseAirportWarnings(JSON.parse(text))),
  ]);
  return { fetchedAt: new Date().toISOString(), news: news.status === 'fulfilled' ? news.value : [], warnings: warnings.status === 'fulfilled' ? warnings.value : [], newsAvailable: news.status === 'fulfilled', warningsAvailable: warnings.status === 'fulfilled' };
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Robots-Tag', 'noindex');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end(); }
  if (!cache || Date.now() - Date.parse(cache.fetchedAt) >= 300_000) {
    if (!pending) pending = collect().then(result => { cache = result; return result; }).finally(() => { pending = undefined; });
    await pending;
  }
  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60');
  return res.status(200).json(cache);
}
