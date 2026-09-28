const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
function load(name) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, name + '.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, require: name => load(name.replace('./', '')), Date, Intl });
  return exports;
}
const { availableSlots, calculateGroup, timeSlotLabel } = load('trailBooking');
const now = Date.parse('2026-09-27T10:00:00Z');
const date = '2026-10-11';
const slot = (start, visitor = 50, dateValue = date) => ({ date: dateValue, start, end: '13:00', percentages: { visitor, operator: 0, resident: 100 } });
const day = { date, slots: [slot('12:00'), slot('12:30'), slot('13:00', 0), slot('13:30', null)], checkedAt: new Date(now).toISOString(), error: false };
const seats = { [`${date}/12:00`]: { seats: 8, checkedAt: now }, [`${date}/12:30`]: { seats: 6, checkedAt: now }, [`${date}/13:00`]: { seats: 99, checkedAt: now }, [`${date}/13:30`]: { seats: 99, checkedAt: now } };
test('only available times for the chosen category appear; zero and unknown are hidden', () => {
  assert.equal(availableSlots(day, 'visitor', now).map(slot => slot.start).join(','), '12:00,12:30');
  assert.equal(availableSlots(day, 'operator', now).length, 0);
  assert.equal(availableSlots({ ...day, error: true }, 'visitor', now).length, 0);
});
test('past times are excluded using Madeira local time', () => {
  const today = { ...day, date: '2026-09-27', slots: [slot('09:00', 100, '2026-09-27'), slot('14:00', 100, '2026-09-27')] };
  assert.equal(availableSlots(today, 'visitor', now).map(slot => slot.start).join(','), '14:00');
});
test('explicit calculation distinguishes missing input, insufficient capacity, and a split', () => {
  assert.equal(calculateGroup(day, 'visitor', {}, 14, true, 30, now).status, 'missing-counts');
  const together = calculateGroup(day, 'visitor', seats, 14, false, 30, now);
  assert.equal(together.status, 'no-fit'); assert.equal(together.checkedSeats, 14);
  const split = calculateGroup(day, 'visitor', seats, 14, true, 30, now);
  assert.equal(split.status, 'fits'); assert.equal(split.plans[0].map(item => item.people).join(','), '8,6');
  assert.equal(calculateGroup(day, 'visitor', seats, 15, true, 30, now).status, 'no-fit');
});
test('stale source, invalid groups, and expired counts cannot confirm a fit', () => {
  assert.equal(calculateGroup(day, 'visitor', seats, 14, true, 30, now + 300000).status, 'stale');
  assert.equal(calculateGroup(day, 'visitor', seats, 0, true, 30, now).status, 'invalid');
  const old = { [`${date}/12:00`]: { seats: 14, checkedAt: now - 300000 } };
  assert.equal(calculateGroup(day, 'visitor', old, 14, true, 30, now).status, 'missing-counts');
});
test('time-slot labels use natural Ukrainian plurals', () => {
  assert.equal(timeSlotLabel(1, true), 'тайм-слот');
  assert.equal(timeSlotLabel(2, true), 'тайм-слоти');
  assert.equal(timeSlotLabel(10, true), 'тайм-слотів');
  assert.equal(timeSlotLabel(11, true), 'тайм-слотів');
  assert.equal(timeSlotLabel(21, true), 'тайм-слот');
});
