const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const { normalizeStackFlights, readStackPage } = require('./aviationstack.ts');
const store = require('./flightSnapshotStore.ts');
const { flightSnapshotText } = require('./i18n/flightSnapshot.ts');
const fixture = (direction, index = 0) => ({ flight: { iata: 'TEST' + index }, airline: { name: 'Test airline' }, flight_status: 'scheduled', departure: { iata: direction === 'departures' ? 'FNC' : 'LIS', airport: 'Test origin', scheduled: '2026-10-18T12:00:00+01:00', delay: 15 }, arrival: { iata: direction === 'arrivals' ? 'FNC' : 'LIS', airport: 'Test destination', scheduled: '2026-10-18T14:00:00+01:00' } });
assert.equal(normalizeStackFlights([fixture('arrivals')], 'arrivals')[0].scheduled, '2026-10-18T13:00:00.000Z');
assert.equal(normalizeStackFlights([fixture('departures')], 'departures')[0].status, 'Delayed');
assert.equal(normalizeStackFlights([{ ...fixture('arrivals'), flight_status: 'cancelled' }], 'arrivals')[0].status, 'Canceled');
assert.throws(() => normalizeStackFlights([fixture('departures')], 'arrivals'));
assert.throws(() => readStackPage({ data: [], pagination: { count: 0, offset: 0, total: 2 } }, 0));
assert.throws(() => readStackPage({ error: { code: 'limit' } }, 0));
const quota = { calls: [], retryAt: 0 };
for (let i = 0; i < 80; i++) store.reserveFlightCall(quota, 1000);
assert.throws(() => store.reserveFlightCall(quota, 1001));
store.reserveFlightCall(quota, store.BUDGET_WINDOW + 1001);
assert.equal(quota.calls.length, 1);
for (const locale of ['en','pt','de','fr','es','pl','uk']) assert.ok(Object.values(flightSnapshotText(locale)).every(Boolean));
async function call(handler, method = 'POST', origin) {
  const response = { headers: {}, setHeader(k,v) {this.headers[k]=v;}, status(code) {this.code=code; return this;}, json(body) {this.body=body; return this;} };
  await handler({ method, headers: { host: 'localhost:3100', origin } }, response);
  return response;
}
(async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.AVIATIONSTACK_API_KEY;
  const originalStore = store.withFlightStore;
  let state = { calls: [], retryAt: 0 };
  let saves = 0;
  store.withFlightStore = async (_key, run) => run(state, async () => {saves++;});
  const handler = require('../pages/api/airport-flights.ts').default;
  try {
    delete process.env.AVIATIONSTACK_API_KEY;
    assert.equal((await call(handler)).code, 503);
    assert.equal((await call(handler, 'GET')).code, 405);
    assert.equal((await call(handler, 'POST', 'https://unrelated.example')).code, 403);
    process.env.AVIATIONSTACK_API_KEY = 'test-only';
    let requests = 0;
    global.fetch = async raw => {
      requests++;
      assert.ok(saves >= requests, 'Budget must be saved before each external call');
      const url = new URL(raw);
      assert.equal(url.origin, 'https://api.aviationstack.com');
      const direction = url.searchParams.has('arr_iata') ? 'arrivals' : 'departures';
      const offset = Number(url.searchParams.get('offset'));
      return { ok: true, json: async () => ({ data: [fixture(direction, offset)], pagination: { offset, count: 1, total: 2 } }) };
    };
    const responses = await Promise.all([call(handler), call(handler)]);
    assert.ok(responses.every(r=>r.code===200));
    assert.equal(requests, 4);
    assert.equal(responses[0].body.arrivals.length, 2);
    assert.equal(responses[0].body.departures.length, 2);
    assert.equal((await call(handler)).code, 200);
    assert.equal(requests, 4, 'Cached reads must not consume provider quota');
    assert.ok(!JSON.stringify(responses[0].body).includes('test-only'));
    state.snapshot.nextRefreshAt = '2000-01-01T00:00:00Z';
    global.fetch = async () => {requests++; return {ok:false};};
    const failed = await call(handler);
    assert.equal(failed.body.refreshUnavailable, true);
    assert.equal(failed.body.arrivals.length, 2);
    await call(handler);
    assert.equal(requests, 5, 'Cooldown must prevent another provider call');
    console.log('PASS: complete pagination, mapping, timezone, cancellation, seven locales, POST-only, no-key, origin guard, persisted quota reservation, concurrency, shared cache and failed-refresh fallback. No live provider calls.');
  } finally {
    global.fetch = originalFetch; store.withFlightStore = originalStore;
    if (originalKey === undefined) delete process.env.AVIATIONSTACK_API_KEY; else process.env.AVIATIONSTACK_API_KEY=originalKey;
  }
})().catch(error => {console.error(error);process.exitCode=1;});
