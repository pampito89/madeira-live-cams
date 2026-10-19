const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const { normalizeStackFlights } = require('./aviationstack.ts');
const { remainingToday } = require('./todayFlights.ts');
const { boardNeedsRefresh, flightNeedsReview } = require('./flightFreshness.ts');
const { flightSnapshotText } = require('./i18n/flightSnapshot.ts');
const now = Date.parse('2026-10-19T12:00:00Z');
const originalNow = Date.now;
Date.now = () => now;
try {
  const row = { flight_status: 'active', flight: { iata: 'TP1701' }, arrival: { iata: 'FNC', scheduled: '2026-10-19T07:45:00Z', actual_runway: '2026-10-19T07:45:00Z' }, departure: { iata: 'LIS' } };
  const landed = normalizeStackFlights([row], 'arrivals')[0];
  assert.equal(landed.status, 'Arrived');
  assert.equal(remainingToday([landed], now).length, 0);
  const future = normalizeStackFlights([{ ...row, arrival: { ...row.arrival, actual_runway: '2026-10-19T15:00:00Z' } }], 'arrivals')[0];
  assert.equal(future.status, 'EnRoute');
  const invalid = normalizeStackFlights([{ ...row, arrival: { ...row.arrival, actual_runway: 'invalid' } }], 'arrivals')[0];
  assert.equal(invalid.status, 'EnRoute');
  const fresh = new Date(now).toISOString();
  assert.equal(flightNeedsReview(invalid, fresh, now), true);
  assert.equal(flightNeedsReview({ ...invalid, status: 'Delayed', revised: '2026-10-19T13:00:00Z' }, fresh, now), false);
  assert.equal(flightNeedsReview({ ...invalid, status: 'Canceled' }, fresh, now), false);
  assert.equal(boardNeedsRefresh(fresh, now + 299999), false);
  assert.equal(boardNeedsRefresh(fresh, now + 300000), true);
  assert.equal(flightNeedsReview({ ...invalid, scheduled: '2026-10-19T13:00:00Z' }, fresh, now + 300000), true);
  for (const locale of ['en','pt','de','fr','es','pl','uk']) {
    assert.ok(flightSnapshotText(locale).unconfirmed);
    assert.ok(flightSnapshotText(locale).refreshNeeded);
  }
  console.log('PASS: actual landing overrides stale status; completed arrivals excluded; no inferred landing; overdue and stale statuses; future delays; all seven languages.');
} finally { Date.now = originalNow; }
