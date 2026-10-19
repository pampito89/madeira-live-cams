import type { NextApiRequest, NextApiResponse } from 'next';
import { normalizeStackFlights, readStackPage, type FlightSnapshot } from '../../lib/aviationstack';
import { remainingToday } from '../../lib/todayFlights';
import type { FlightDirection } from '../../lib/airportFlights';
export const config = { maxDuration: 60 };
let pending: Promise<FlightSnapshot> | undefined;
async function snapshot(key: string): Promise<FlightSnapshot> {
  const deadline = Date.now() + 45_000;
  async function directionRows(direction: FlightDirection) {
    const rows: unknown[] = [];
    let total = Infinity;
    while (rows.length < total) {
      if (Date.now() >= deadline) throw new Error('Flight deadline');
      const url = new URL('https://api.aviationstack.com/v1/flights');
      url.search = new URLSearchParams({ access_key: key, [direction === 'arrivals' ? 'arr_iata' : 'dep_iata']: 'FNC', limit: '100', offset: String(rows.length) }).toString();
      const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(Math.max(1, Math.min(10_000, deadline - Date.now()))) });
      if (!response.ok) throw new Error('Flight provider unavailable');
      const page = readStackPage(await response.json(), rows.length);
      if (total !== Infinity && total !== page.total) throw new Error('Flight listing changed during pagination');
      total = page.total;
      rows.push(...page.rows);
    }
    return normalizeStackFlights(rows, direction);
  }
  const arrivals = await directionRows('arrivals');
  const departures = await directionRows('departures');
  const now = Date.now();
  const fetchedAt = new Date(now).toISOString();
  return { fetchedAt, nextRefreshAt: fetchedAt, arrivals: remainingToday(arrivals, now), departures: remainingToday(departures, now) };
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
  if (req.headers.origin) {
    try { if (new URL(req.headers.origin).host !== req.headers.host) return res.status(403).json({ error: 'forbidden' }); }
    catch { return res.status(403).json({ error: 'forbidden' }); }
  }
  const key = process.env.AVIATIONSTACK_API_KEY?.trim();
  if (!key) return res.status(503).json({ error: 'flights_unavailable' });
  try {
    if (!pending) pending = snapshot(key).finally(() => { pending = undefined; });
    return res.status(200).json(await pending);
  } catch { return res.status(503).json({ error: 'flights_unavailable' }); }
}
