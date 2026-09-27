import { BOOKING_URL, normalizeSlots, Trail, TrailDay, addDays } from './trailAvailability';

const API = 'https://simplifica.madeira.gov.pt/api';
const TIMEOUT = 12000;
const CACHE_TTL = 60000;
type Session = { cookie: string; csrf: string };
let catalog: { trails: Trail[]; expires: number } | undefined;
let catalogPending: Promise<Trail[]> | undefined;
const calendarCache = new Map<string, { day: TrailDay; expires: number }>();
const pending = new Map<string, Promise<TrailDay[]>>();

async function readJson(response: Response) {
  if (!response.ok) throw new Error('SIMplifica unavailable');
  const body = await response.json();
  if (body.status !== true || body.data == null) throw new Error('Invalid SIMplifica response');
  return body.data;
}

export async function getTrails(): Promise<Trail[]> {
  if (catalog && catalog.expires > Date.now()) return catalog.trails;
  if (catalogPending) return catalogPending;
  catalogPending = (async () => {
    const rows = await readJson(await fetch(`${API}/infoProcess/259/resources`, { signal: AbortSignal.timeout(TIMEOUT) }));
    if (!Array.isArray(rows) || !rows.length || rows.some(row => !Number.isInteger(row.id) || typeof row.name !== 'string')) throw new Error('Invalid catalog');
    const trails: Trail[] = rows.map(({ id, name }) => ({ id, name: name.trim() }));
    trails.sort((a, b) => a.name.localeCompare(b.name, 'pt', { numeric: true }));
    catalog = { trails, expires: Date.now() + 3600000 };
    return trails;
  })();
  try { return await catalogPending; } finally { catalogPending = undefined; }
}

async function anonymousSession(): Promise<Session> {
  const response = await fetch(BOOKING_URL, { signal: AbortSignal.timeout(TIMEOUT) });
  if (!response.ok) throw new Error('SIMplifica unavailable');
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  const cookies = headers.getSetCookie?.() ?? (headers.get('set-cookie') || '').split(/,(?=\s*[^;,=]+=[^;,]*)/);
  const pairs = cookies.map(cookie => cookie.split(';')[0].trim()).filter(Boolean);
  const xsrf = pairs.find(cookie => cookie.startsWith('XSRF-TOKEN='));
  await response.body?.cancel();
  if (!xsrf) throw new Error('Missing anonymous session');
  return { cookie: pairs.join('; '), csrf: decodeURIComponent(xsrf.slice('XSRF-TOKEN='.length)) };
}

async function getDay(resourceId: number, date: string, session: Session): Promise<TrailDay> {
  const key = `${resourceId}/${date}`;
  const cached = calendarCache.get(key);
  if (cached && cached.expires > Date.now()) return cached.day;
  const [year, month, day] = date.split('-').map(Number);
  // This is the public calendar's read-only POST, never a reservation request.
  const rows = await readJson(await fetch(`${API}/resources/intervals`, {
    method: 'POST', signal: AbortSignal.timeout(TIMEOUT),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Cookie: session.cookie, 'X-XSRF-TOKEN': session.csrf, Referer: BOOKING_URL },
    body: JSON.stringify({ resourceId, year, month, day }),
  }));
  const result: TrailDay = { date, slots: normalizeSlots(rows, date), checkedAt: new Date().toISOString(), error: false };
  if (calendarCache.size >= 500) calendarCache.clear();
  calendarCache.set(key, { day: result, expires: Date.now() + CACHE_TTL });
  return result;
}

export async function getWeek(resourceId: number, start: string): Promise<TrailDay[]> {
  const key = `${resourceId}/${start}`;
  const existing = pending.get(key);
  if (existing) return existing;
  if (pending.size >= 8) throw new Error('Busy');
  const request = (async () => {
    const dates = Array.from({ length: 7 }, (_, index) => addDays(start, index));
    if (dates.every(date => (calendarCache.get(`${resourceId}/${date}`)?.expires || 0) > Date.now())) {
      return dates.map(date => calendarCache.get(`${resourceId}/${date}`)!.day);
    }
    const session = await anonymousSession();
    const days: TrailDay[] = [];
    // Limit upstream concurrency; cache and coalesce repeated searches.
    for (let offset = 0; offset < dates.length; offset += 3) {
      const batch = await Promise.allSettled(dates.slice(offset, offset + 3).map(date => getDay(resourceId, date, session)));
      batch.forEach((result, index) => days.push(result.status === 'fulfilled' ? result.value : { date: dates[offset + index], slots: [], checkedAt: null, error: true }));
    }
    return days;
  })();
  pending.set(key, request);
  try { return await request; } finally { pending.delete(key); }
}
