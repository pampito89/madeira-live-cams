export const flightStatuses = ['Unknown', 'Expected', 'EnRoute', 'CheckIn', 'Boarding', 'GateClosed', 'Departed', 'Delayed', 'Approaching', 'Arrived', 'Canceled', 'Diverted', 'CanceledUncertain'] as const;
export type FlightStatus = typeof flightStatuses[number];
export type FlightDirection = 'arrivals' | 'departures';
export type AirportFlight = {
  number: string;
  airline: string;
  airport: string;
  airportCode: string;
  scheduled: string | null;
  revised: string | null;
  status: FlightStatus;
};
export type AirportFlightBoard = {
  fetchedAt: string;
  arrivals: AirportFlight[];
  departures: AirportFlight[];
};

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => value && typeof value === 'object' && !Array.isArray(value) ? value as RecordValue : {};
const text = (value: unknown) => typeof value === 'string' ? value.slice(0, 160) : '';
function utc(value: unknown): string | null {
  const raw = text(record(value).utc);
  if (!raw) return null;
  // The provider labels this field UTC, including examples without a timezone suffix.
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw) ? raw : raw.replace(' ', 'T') + 'Z';
  const timestamp = Date.parse(normalized);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}
function normalizeFlights(value: unknown, direction: FlightDirection): AirportFlight[] {
  if (!Array.isArray(value)) throw new Error('Invalid flight list');
  const seen = new Set<string>();
  return value.flatMap((item): AirportFlight[] => {
    const flight = record(item);
    const number = text(flight.number);
    if (!number) return [];
    const movement = record(flight.movement ?? flight[direction === 'arrivals' ? 'arrival' : 'departure']);
    const opposite = record(flight[direction === 'arrivals' ? 'departure' : 'arrival']);
    const airport = record(flight.movement ? movement.airport : opposite.airport);
    const scheduled = utc(movement.scheduledTime);
    const id = number + ':' + scheduled;
    if (seen.has(id)) return [];
    seen.add(id);
    const status = flightStatuses.includes(flight.status as FlightStatus) ? flight.status as FlightStatus : 'Unknown';
    return [{ number, airline: text(record(flight.airline).name), airport: text(airport.name), airportCode: text(airport.iata) || text(airport.icao), scheduled, revised: utc(movement.revisedTime), status }];
  }).sort((a, b) => (a.scheduled ?? '9999').localeCompare(b.scheduled ?? '9999'));
}
export function normalizeAirportFlights(payload: unknown, fetchedAt: string): AirportFlightBoard {
  const data = record(payload);
  // A missing list is an upstream error, not evidence that there are no flights.
  return { fetchedAt, arrivals: normalizeFlights(data.arrivals, 'arrivals'), departures: normalizeFlights(data.departures, 'departures') };
}
