import type { NextApiRequest, NextApiResponse } from 'next';
import { normalizeStackFlights, readStackPage, type FlightSnapshot } from '../../lib/aviationstack';
import { withFlightStore, reserveFlightCall, SNAPSHOT_TTL } from '../../lib/flightSnapshotStore';
import type { FlightDirection } from '../../lib/airportFlights';

export const config = { maxDuration: 60 };
let pending: Promise<FlightSnapshot> | undefined;
async function snapshot(key: string): Promise<FlightSnapshot> {
  return withFlightStore(key, async (state, save) => {
    const now = Date.now();
    if (state.snapshot && now < Date.parse(state.snapshot.nextRefreshAt)) return state.snapshot;
    if (now < state.retryAt) {
      if (state.snapshot) return { ...state.snapshot, refreshUnavailable: true };
      throw new Error('Flight retry cooldown');
    }
    const deadline = now + 45_000;
    async function directionRows(direction: FlightDirection) {
      const rows: unknown[] = [];
      let total = Infinity;
      while (rows.length < total) {
        if (Date.now() >= deadline) throw new Error('Flight deadline');
        reserveFlightCall(state, Date.now());
        await save(); // Persist the budget BEFORE contacting the provider, including failures.
        const url = new URL('https://api.aviationstack.com/v1/flights');
        url.search = new URLSearchParams({ access_key: key, [direction === 'arrivals' ? 'arr_iata' : 'dep_iata']: 'FNC', limit: '100', offset: String(rows.length) }).toString();
        const response = await fetch(url, { signal: AbortSignal.timeout(Math.min(10_000, deadline - Date.now())) });
        if (!response.ok) throw new Error('Flight provider unavailable');
        const page = readStackPage(await response.json(), rows.length);
        if (total !== Infinity && total !== page.total) throw new Error('Flight listing changed during pagination');
        total = page.total;
        rows.push(...page.rows);
      }
      return normalizeStackFlights(rows, direction);
    }
    try {
      const arrivals = await directionRows('arrivals');
      const departures = await directionRows('departures');
      const fetchedAt = new Date().toISOString();
      const result: FlightSnapshot = { fetchedAt, nextRefreshAt: new Date(Date.parse(fetchedAt) + SNAPSHOT_TTL).toISOString(), arrivals, departures };
      state.snapshot = result;
      state.retryAt = 0;
      await save();
      return result;
    } catch {
      state.retryAt = Date.now() + 6 * 60 * 60_000;
      await save();
      if (state.snapshot) return { ...state.snapshot, refreshUnavailable: true };
      throw new Error('Flights unavailable');
    }
  });
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('X-Robots-Tag', 'noindex');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const origin = req.headers.origin;
  if (origin) {
    try { if (new URL(origin).host !== req.headers.host) return res.status(403).json({ error: 'forbidden' }); }
    catch { return res.status(403).json({ error: 'forbidden' }); }
  }
  const key = process.env.AVIATIONSTACK_API_KEY?.trim();
  if (!key) return res.status(503).json({ error: 'flights_unavailable' });
  try {
    if (!pending) pending = snapshot(key).finally(() => { pending = undefined; });
    return res.status(200).json(await pending);
  } catch {
    res.setHeader('Retry-After', '60');
    return res.status(503).json({ error: 'flights_unavailable' });
  }
}
