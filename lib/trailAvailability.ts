export type BookingCategory = 'visitor' | 'operator' | 'resident';
export type Trail = { id: number; name: string };
export type TrailSlot = {
  date: string;
  start: string;
  end: string;
  percentages: Record<BookingCategory, number | null>;
};
export type TrailDay = { date: string; slots: TrailSlot[]; checkedAt: string | null; error: boolean };
export type AvailabilityResult = { days: TrailDay[]; source: string };
export type SeatEntry = { seats: number; checkedAt: number };
export type Allocation = { start: string; end: string; people: number };
export const BOOKING_URL = 'https://simplifica.madeira.gov.pt/services/78-82-259';
export const SEAT_ENTRY_TTL = 5 * 60 * 1000;

export function madeiraDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Atlantic/Madeira', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function addDays(date: string, count: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + count);
  return value.toISOString().slice(0, 10);
}

export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function parsePercentages(title: string): TrailSlot['percentages'] {
  const result: TrailSlot['percentages'] = { visitor: null, operator: null, resident: null };
  const matches = Array.from(title.matchAll(/(\d+(?:[.,]\d+)?)%\s*(Não residentes|Operadores económicos|Residentes)/gi));
  for (const match of matches) {
    const category = match[2].toLowerCase();
    const key: BookingCategory = category === 'não residentes' ? 'visitor' : category === 'residentes' ? 'resident' : 'operator';
    const value = Number(match[1].replace(',', '.'));
    if (value >= 0 && value <= 100) result[key] = value;
  }
  return result;
}

export function normalizeSlots(input: unknown, date: string): TrailSlot[] {
  if (!Array.isArray(input)) throw new Error('Invalid calendar response');
  const slots = input.map((row) => {
    const begin = row?.begin?.date;
    const end = row?.end?.date;
    if (typeof begin !== 'string' || typeof end !== 'string' || typeof row.slotTitle !== 'string' ||
      !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:/.test(begin) || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:/.test(end) ||
      begin.slice(0, 10) !== date || end.slice(0, 10) !== date || end <= begin) throw new Error('Invalid slot');
    // maximumCapacity and reservations are not category-specific remaining seats.
    // Never infer a seat count from these fields or rounded percentages.
    return { date, start: begin.slice(11, 16), end: end.slice(11, 16), percentages: parsePercentages(row.slotTitle) };
  });
  return slots.sort((a, b) => a.start.localeCompare(b.start));
}

function minutes(time: string) {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

/** Uses only recently entered seat counts, within one date and the allowed start-time gap. */
export function allocateGroup(slots: TrailSlot[], entries: Record<string, SeatEntry>, people: number, split: boolean, maxGap: number, now = Date.now()): Allocation[][] {
  if (!Number.isInteger(people) || people < 1 || people > 100 || !Number.isFinite(maxGap) || maxGap < 0) return [];
  const available = slots.map(slot => ({ slot, entry: entries[`${slot.date}/${slot.start}`] }))
    .filter(({ entry }) => entry && Number.isInteger(entry.seats) && entry.seats > 0 && now >= entry.checkedAt && now - entry.checkedAt < SEAT_ENTRY_TTL)
    .sort((a, b) => `${a.slot.date}/${a.slot.start}`.localeCompare(`${b.slot.date}/${b.slot.start}`));
  const results: Allocation[][] = [];
  for (let i = 0; i < available.length; i++) {
    const first = available[i];
    let remaining = people;
    const plan: Allocation[] = [];
    for (let j = i; j < available.length; j++) {
      const { slot, entry } = available[j];
      if (slot.date !== first.slot.date || minutes(slot.start) - minutes(first.slot.start) > maxGap || (!split && j > i)) break;
      const take = Math.min(remaining, entry.seats);
      plan.push({ start: slot.start, end: slot.end, people: take });
      remaining -= take;
      if (remaining === 0) { results.push(plan); break; }
    }
  }
  return results.sort((a, b) => a.length - b.length || a[0].start.localeCompare(b[0].start));
}
