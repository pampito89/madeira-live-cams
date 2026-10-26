import type { IslandEvent } from '../data/events';
export type EventDateRange = { from: string; to: string };
export function selectRangeDay(range: EventDateRange, day: string, choosingEnd: boolean): { range: EventDateRange; choosingEnd: boolean } {
  if (!choosingEnd || !range.from) return { range: { from: day, to: day }, choosingEnd: true };
  return { range: { from: day < range.from ? day : range.from, to: day < range.from ? range.from : day }, choosingEnd: false };
}
export function madeiraDate(now = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Atlantic/Madeira', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function filterEvents(events: IslandEvent[], filters: { today: string; query?: string; municipality?: string; category?: string; date?: string; dateRange?: EventDateRange }) {
  const query = (filters.query || '').trim().toLocaleLowerCase();
  const from = filters.dateRange?.from || '';
  const to = filters.dateRange?.to || from;
  const first = from && to && to < from ? to : from;
  const last = from && to && to < from ? from : to;
  return events.filter(event => event.end >= filters.today
    && (!filters.municipality || event.municipalities.includes(filters.municipality))
    && (!filters.category || event.category === filters.category)
    && (!filters.date || (event.start <= filters.date && event.end >= filters.date))
    && (!first || event.end >= first)
    && (!last || event.start <= last)
    && (!query || `${event.title} ${event.description} ${event.venue} ${event.municipalities.join(' ')}`.toLocaleLowerCase().includes(query)))
    .sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
}
export function monthDays(month: string) {
  const [year, number] = month.split('-').map(Number);
  const offset = (new Date(Date.UTC(year, number - 1, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return [...Array.from({ length: offset }, () => ''), ...Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)];
}
export function shiftMonth(month: string, amount: number) {
  const [year, number] = month.split('-').map(Number);
  return new Date(Date.UTC(year, number - 1 + amount, 1)).toISOString().slice(0, 7);
}
