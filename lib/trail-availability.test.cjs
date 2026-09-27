const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const loaded = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, 'trailAvailability.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: loaded, Intl, Date });
const { allocateGroup, normalizeSlots, parsePercentages, validDate, addDays, SEAT_ENTRY_TTL } = loaded;
const now = 1000000;
const slot = (start, date = '2026-09-27') => ({ date, start, end: `${start.slice(0, 2)}:30`, percentages: { visitor: 50, operator: 100, resident: 100 } });
const seats = (values, checkedAt = now) => Object.fromEntries(Object.entries(values).map(([time, count]) => [`2026-09-27/${time}`, { seats: count, checkedAt }]));

test('category order cannot confuse residents with non-residents', () => {
  const result = parsePercentages('Disponibilidade: 100% Residentes • 0% Não residentes • 46% Operadores económicos');
  assert.equal(result.visitor, 0); assert.equal(result.resident, 100); assert.equal(result.operator, 46);
  assert.equal(parsePercentages('Unknown').visitor, null);
});
test('never infer remaining seats from generic capacity or reservations', () => {
  const [result] = normalizeSlots([{ begin: { date: '2026-09-27 07:00:00.000000' }, end: { date: '2026-09-27 07:30:00.000000' }, maximumCapacity: 70, reservations: 0, slotTitle: '0% Não residentes • 100% Residentes' }], '2026-09-27');
  assert.equal(result.percentages.visitor, 0);
  assert.equal(result.remainingSeats, undefined);
  assert.equal(allocateGroup([result], {}, 14, false, 30, now).length, 0);
});
test('14 people together require 14 checked seats', () => {
  assert.equal(allocateGroup([slot('07:00')], seats({ '07:00': 13 }), 14, false, 30, now).length, 0);
  assert.equal(allocateGroup([slot('07:00')], seats({ '07:00': 14 }), 14, false, 30, now)[0][0].people, 14);
});
test('8 + 6 people split across starts within 30 minutes', () => {
  const slots = [slot('07:00'), slot('07:30')];
  const entries = seats({ '07:00': 8, '07:30': 6 });
  assert.equal(allocateGroup(slots, entries, 14, false, 30, now).length, 0);
  const result = allocateGroup(slots, entries, 14, true, 30, now);
  assert.equal(result.length, 1);
  assert.equal(result[0].map(item => item.people).join(','), '8,6');
});
test('do not combine distant starts, different dates or stale counts', () => {
  const entries = seats({ '07:00': 8, '08:00': 6 });
  assert.equal(allocateGroup([slot('07:00'), slot('08:00')], entries, 14, true, 30, now).length, 0);
  assert.equal(allocateGroup([slot('07:00'), slot('08:00', '2026-09-28')], entries, 14, true, 90, now).length, 0);
  assert.equal(allocateGroup([slot('07:00')], seats({ '07:00': 20 }, now - SEAT_ENTRY_TTL), 14, false, 30, now).length, 0);
});
test('invalid groups and dates are rejected and week crosses month boundaries', () => {
  for (const count of [0, -1, NaN, 1.5, 101]) assert.equal(allocateGroup([slot('07:00')], seats({ '07:00': 20 }), count, true, 30, now).length, 0);
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validDate('2026-09-27'), true);
  assert.equal(addDays('2026-09-29', 6), '2026-10-05');
  assert.throws(() => normalizeSlots([{}], '2026-09-27'));
});
