import type { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';
import { Coordinates, googleRouteMinutes, RouteServiceError } from '../../lib/googleRouteMinutes';

type RouteUsage = { limit: number; used: number; remaining: number; month: string };
type Response = { durationMinutes: number; usage?: RouteUsage } | { error: string; usage?: RouteUsage };
const MONTHLY_ROUTE_LIMIT = 9500;

function isCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== 'object') return false;
  const point = value as Coordinates;
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
    && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180;
}

async function reserveRouteRequest() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new RouteServiceError(503, 'Google Routes usage counter is unavailable.');
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit',
  }).formatToParts(new Date());
  const month = `${parts.find(part => part.type === 'year')?.value}-${parts.find(part => part.type === 'month')?.value}`;
  const result = await Redis.fromEnv().eval(
    `local current = tonumber(redis.call('GET', KEYS[1]) or '0')
     if current >= tonumber(ARGV[1]) then return -1 end
     return redis.call('INCR', KEYS[1])`,
    [`google-routes-usage:${month}`], [String(MONTHLY_ROUTE_LIMIT)],
  );
  const value = Number(result);
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < -1) {
    throw new RouteServiceError(503, 'Google Routes usage counter is unavailable.');
  }
  const used = value === -1 ? MONTHLY_ROUTE_LIMIT : value;
  return { allowed: value !== -1, usage: { limit: MONTHLY_ROUTE_LIMIT, used, remaining: Math.max(0, MONTHLY_ROUTE_LIMIT - used), month } };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  const { origin, destination } = req.body ?? {};
  if (!isCoordinates(origin) || !isCoordinates(destination)) {
    return res.status(400).json({ error: 'Valid origin and destination coordinates are required.' });
  }
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY is not configured.' });
  let usage: RouteUsage | undefined;
  try {
    const durationMinutes = await googleRouteMinutes(origin, destination, apiKey, async () => {
      let reservation: Awaited<ReturnType<typeof reserveRouteRequest>>;
      try { reservation = await reserveRouteRequest(); }
      catch { throw new RouteServiceError(503, 'Google Routes usage counter is unavailable.'); }
      usage = reservation.usage;
      if (!reservation.allowed) throw new RouteServiceError(429, 'The monthly Google Routes limit has been reached.');
    });
    return res.status(200).json({ durationMinutes, ...(usage ? { usage } : {}) });
  } catch (error) {
    const status = error instanceof RouteServiceError ? error.status : 503;
    const message = error instanceof RouteServiceError ? error.message : 'Unable to calculate route time.';
    console.error('Route-time request failed:', status, message);
    return res.status(status).json({ error: message, ...(usage ? { usage } : {}) });
  }
}
