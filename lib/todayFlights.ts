import type { AirportFlight } from './airportFlights';
const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Atlantic/Madeira', year: 'numeric', month: '2-digit', day: '2-digit' });
export function remainingToday(flights: AirportFlight[], now: number): AirportFlight[] {
  const today = dayFormat.format(now);
  return flights.filter(flight => {
    if (['Arrived', 'Departed'].includes(flight.status)) return false;
    const effective = flight.revised || flight.scheduled;
    if (!effective || dayFormat.format(new Date(effective)) !== today) return false;
    return Date.parse(effective) >= now || ['EnRoute', 'Approaching', 'Delayed', 'Boarding', 'GateClosed'].includes(flight.status);
  }).sort((a, b) => (a.revised || a.scheduled || '').localeCompare(b.revised || b.scheduled || ''));
}
export const flightSearchKey = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');
