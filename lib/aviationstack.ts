import type { AirportFlight, AirportFlightBoard, FlightDirection, FlightStatus } from './airportFlights';
export type FlightSnapshot = AirportFlightBoard & { nextRefreshAt: string; refreshUnavailable?: boolean };
type Row = Record<string, any>;
const text = (v: unknown) => typeof v === 'string' ? v.slice(0, 200) : '';
function instant(v: unknown): string | null {
  if (typeof v !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/i.test(v)) return null;
  const stamp = Date.parse(v);
  return Number.isFinite(stamp) ? new Date(stamp).toISOString() : null;
}
export function normalizeStackFlights(rows: unknown[], direction: FlightDirection): AirportFlight[] {
  const seen = new Set<string>();
  return rows.map((value): AirportFlight => {
    const row = value as Row;
    const movement = row?.[direction === 'arrivals' ? 'arrival' : 'departure'];
    const opposite = row?.[direction === 'arrivals' ? 'departure' : 'arrival'];
    if (movement?.iata !== 'FNC') throw new Error('Unexpected airport');
    const statusMap: Record<string, FlightStatus> = { scheduled: 'Expected', active: direction === 'arrivals' ? 'EnRoute' : 'Departed', landed: direction === 'arrivals' ? 'Arrived' : 'Departed', cancelled: 'Canceled', diverted: 'Diverted', incident: 'Unknown' };
    let status = statusMap[row.flight_status] ?? 'Unknown';
    const actual = instant(movement.actual) || instant(movement.actual_runway);
    // A recorded movement is stronger evidence than a lagging flight_status.
    // Do not interpret a future or malformed actual timestamp as confirmation.
    if (actual && Date.parse(actual) <= Date.now()) status = direction === 'arrivals' ? 'Arrived' : 'Departed';
    if (status === 'Expected' && typeof movement.delay === 'number' && movement.delay > 0) status = 'Delayed';
    return { number: text(row.flight?.iata) || text(row.flight?.icao) || text(row.flight?.number) || '—', airline: text(row.airline?.name), airport: text(opposite?.airport), airportCode: text(opposite?.iata), scheduled: instant(movement.scheduled), revised: actual || instant(movement.estimated) || instant(movement.estimated_runway), status };
  }).filter(row => {
    const id = JSON.stringify(row);
    if (seen.has(id)) return false;
    seen.add(id); return true;
  }).sort((a, b) => (a.scheduled ?? '9999').localeCompare(b.scheduled ?? '9999'));
}
export function readStackPage(payload: unknown, offset: number): { rows: unknown[]; total: number } {
  const p = payload as Row;
  if (!p || p.error || !Array.isArray(p.data) || !Number.isInteger(p.pagination?.total) || p.pagination.total < 0 || p.pagination.offset !== offset || p.pagination.count !== p.data.length) throw new Error('Invalid flight page');
  if (!p.data.length && offset < p.pagination.total) throw new Error('Incomplete flight page');
  return { rows: p.data, total: p.pagination.total };
}
