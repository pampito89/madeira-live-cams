import { addDays, validDate } from './trailAvailability';

/** Inclusive range; bounded to keep requests and the calendar manageable. */
export function planningDates(start: string, end: string): string[] {
  if (!validDate(start) || !validDate(end) || end < start) return [];
  const count = Math.round((Date.parse(`${end}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86400000) + 1;
  return count <= 60 ? Array.from({ length: count }, (_, index) => addDays(start, index)) : [];
}

export function weekStarts(dates: string[]): string[] {
  return dates.filter((_, index) => index % 7 === 0);
}
