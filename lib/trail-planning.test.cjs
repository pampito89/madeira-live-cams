const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
function load(name) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, name + '.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports, require: name => load(name.replace('./', '')), Date, Intl });
  return exports;
}
const { planningDates, weekStarts } = load('trailPlanning');

test('inclusive month crosses month and year boundaries', () => {
  const dates = planningDates('2026-12-20', '2027-01-18');
  assert.equal(dates.length, 30);
  assert.equal(dates[29], '2027-01-18');
  assert.equal(weekStarts(dates).join(','), '2026-12-20,2026-12-27,2027-01-03,2027-01-10,2027-01-17');
});
test('sixty days cover nine weekly batches across a year boundary', () => {
  const dates = planningDates('2026-12-20', '2027-02-17');
  assert.equal(dates.length, 60);
  assert.equal(dates[59], '2027-02-17');
  assert.equal(weekStarts(dates).length, 9);
  assert.equal(weekStarts(dates)[8], '2027-02-14');
});
test('reject invalid, reversed or oversized ranges', () => {
  for (const [start, end] of [['', '2026-09-27'], ['2026-02-30', '2026-03-01'], ['2026-09-28', '2026-09-27'], ['2026-09-01', '2026-10-31']]) assert.equal(planningDates(start, end).length, 0);
  assert.equal(planningDates('2026-09-27', '2026-09-27').length, 1);
});
test('leap day and daylight saving dates are calendar days', () => {
  assert.equal(planningDates('2028-02-28', '2028-03-01').length, 3);
  assert.equal(planningDates('2026-10-24', '2026-10-26').length, 3);
});
