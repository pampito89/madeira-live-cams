import type { NextApiRequest, NextApiResponse } from 'next';
import { trailWeatherStarts } from '../../data/trailWeatherStarts';
import { normalizeHourly, TrailForecast } from '../../lib/trailWeather';
const cache = new Map<number, TrailForecast>();
const pending = new Map<number, Promise<TrailForecast>>();
const CACHE_TTL_MS = 1_800_000;
async function forecast(route: number): Promise<TrailForecast> {
  const point = trailWeatherStarts[route];
  const params = new URLSearchParams({ latitude: String(point.latitude), longitude: String(point.longitude), hourly: 'cloud_cover,precipitation,weather_code,is_day', timezone: 'Atlantic/Madeira', forecast_days: '16' });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error('Weather unavailable');
  const payload = await response.json();
  const result = { point, fetchedAt: new Date().toISOString(), hours: normalizeHourly(payload.hourly) };
  cache.set(route, result);
  return result;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Robots-Tag', 'noindex');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const route = typeof req.query.route === 'string' && /^\d{1,6}$/.test(req.query.route) ? Number(req.query.route) : 0;
  if (!trailWeatherStarts[route]) return res.status(404).json({ error: 'start_unverified' });
  try {
    let result = cache.get(route);
    if (!result || Date.now() - Date.parse(result.fetchedAt) > CACHE_TTL_MS) {
      let request = pending.get(route);
      if (!request) { request = forecast(route).finally(() => pending.delete(route)); pending.set(route, request); }
      result = await request;
    }
    res.setHeader('Cache-Control', 'public, max-age=900, s-maxage=1800, stale-while-revalidate=3600');
    res.setHeader('CDN-Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json(result);
  } catch { return res.status(503).json({ error: 'weather_unavailable' }); }
}
