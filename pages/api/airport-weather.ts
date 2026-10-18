import type { NextApiRequest, NextApiResponse } from 'next';
import { normalizeAirportWeather, type AirportWeather } from '../../lib/airportWeather';

let cache: AirportWeather | undefined;
let pending: Promise<AirportWeather> | undefined;
let retryAt = 0;
async function fetchObservation(): Promise<AirportWeather> {
  const response = await fetch('https://aviationweather.gov/api/data/metar?ids=LPMA&format=json', {
    headers: { 'User-Agent': 'MadeiraLiveCams/1.0 (https://madeiralivecams.com)', Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok || response.status === 204) throw new Error('METAR unavailable');
  cache = normalizeAirportWeather(await response.json());
  return cache;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Robots-Tag', 'noindex');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'method_not_allowed' }); }
  try {
    if (Date.now() < retryAt) throw new Error('Retry later');
    if (!cache || Date.now() - Date.parse(cache.fetchedAt) >= 300_000) {
      if (!pending) pending = fetchObservation().finally(() => { pending = undefined; });
      await pending;
    }
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60');
    return res.status(200).json(cache);
  } catch {
    if (Date.now() >= retryAt) retryAt = Date.now() + 60_000;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Retry-After', '60');
    return res.status(503).json({ error: 'weather_unavailable' });
  }
}
