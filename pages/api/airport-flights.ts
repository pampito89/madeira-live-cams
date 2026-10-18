import type { NextApiRequest, NextApiResponse } from 'next';
import { normalizeAirportFlights, type AirportFlightBoard } from '../../lib/airportFlights';

const CACHE_MS = 300_000;
let cached: AirportFlightBoard | undefined;
let pending: Promise<AirportFlightBoard> | undefined;
let retryAfter = 0;

async function loadFlights(key: string): Promise<AirportFlightBoard> {
  const query = new URLSearchParams({ offsetMinutes: '-120', durationMinutes: '720', direction: 'Both', withCancelled: 'true', withCodeshared: 'false', withCargo: 'false', withPrivate: 'false' });
  const response = await fetch(`https://aerodatabox.p.rapidapi.com/flights/airports/iata/FNC?${query}`, {
    headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com' },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('Flight provider unavailable');
  const result = normalizeAirportFlights(await response.json(), new Date().toISOString());
  cached = result;
  return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Robots-Tag', 'noindex');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const key = process.env.AERODATABOX_RAPIDAPI_KEY?.trim();
  if (!key || Date.now() < retryAfter) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Retry-After', '60');
    return res.status(503).json({ error: 'flights_unavailable' });
  }
  try {
    if (!cached || Date.now() - Date.parse(cached.fetchedAt) >= CACHE_MS) {
      if (!pending) pending = loadFlights(key).finally(() => { pending = undefined; });
      await pending;
    }
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60');
    return res.status(200).json(cached);
  } catch {
    retryAfter = Date.now() + 60_000;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Retry-After', '60');
    return res.status(503).json({ error: 'flights_unavailable' });
  }
}
