import { allocateGroup, Allocation, BookingCategory, madeiraDate, SeatEntry, SEAT_ENTRY_TTL, TrailDay, TrailSlot } from './trailAvailability';

export function availableSlots(day: TrailDay, category: BookingCategory, now = Date.now()): TrailSlot[] {
  if (day.error) return [];
  const today = madeiraDate(new Date(now));
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Atlantic/Madeira', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(now));
  return day.slots.filter(slot => (slot.percentages[category] ?? 0) > 0 && (slot.date > today || (slot.date === today && slot.start > time)));
}

export type GroupCalculation = { status: 'invalid' | 'stale' | 'missing-counts' | 'no-fit' | 'fits'; plans: Allocation[][]; checkedSeats: number };
export function calculateGroup(day: TrailDay, category: BookingCategory, entries: Record<string, SeatEntry>, people: number, split: boolean, gap: number, now = Date.now()): GroupCalculation {
  const empty = { plans: [], checkedSeats: 0 };
  if (!Number.isInteger(people) || people < 1 || people > 100) return { ...empty, status: 'invalid' };
  const age = day.checkedAt ? now - Date.parse(day.checkedAt) : NaN;
  if (day.error || !Number.isFinite(age) || age < 0 || age >= SEAT_ENTRY_TTL) return { ...empty, status: 'stale' };
  const slots = availableSlots(day, category, now);
  const fresh = slots.map(slot => entries[`${slot.date}/${slot.start}`]).filter(entry => entry && Number.isInteger(entry.seats) && entry.seats >= 0 && entry.seats <= 10000 && now >= entry.checkedAt && now - entry.checkedAt < SEAT_ENTRY_TTL);
  if (!fresh.length) return { ...empty, status: 'missing-counts' };
  const plans = allocateGroup(slots, entries, people, split, gap, now);
  return { status: plans.length ? 'fits' : 'no-fit', plans, checkedSeats: fresh.reduce((sum, entry) => sum + entry.seats, 0) };
}

export function timeSlotLabel(count: number, ukrainian: boolean): string {
  if (!ukrainian) return count === 1 ? 'time slot' : 'time slots';
  const form = new Intl.PluralRules('uk').select(count);
  return form === 'one' ? 'тайм-слот' : form === 'few' ? 'тайм-слоти' : 'тайм-слотів';
}
