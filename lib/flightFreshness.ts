import type { AirportFlight } from './airportFlights';
export const BOARD_FRESHNESS_MS = 5 * 60_000;
export const OVERDUE_STATUS_MS = 30 * 60_000;
export function boardNeedsRefresh(fetchedAt: string, now: number): boolean {
  const fetched = Date.parse(fetchedAt);
  return !Number.isFinite(fetched) || now - fetched >= BOARD_FRESHNESS_MS;
}
export function flightNeedsReview(flight: AirportFlight, fetchedAt: string, now: number): boolean {
  if (['Arrived', 'Departed', 'Canceled', 'Diverted'].includes(flight.status)) return false;
  const expected = Date.parse(flight.revised || flight.scheduled || '');
  return boardNeedsRefresh(fetchedAt, now) || !Number.isFinite(expected) || now - expected >= OVERDUE_STATUS_MS;
}
