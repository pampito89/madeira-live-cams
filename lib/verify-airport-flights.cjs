const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const { normalizeAirportFlights, flightStatuses } = require('./airportFlights.ts');
const { airportFlightText } = require('./i18n/airportFlights.ts');
const fixture = {
  arrivals: [{ number: 'TEST 1', status: 'Canceled', airline: { name: 'Test airline' }, movement: { airport: { name: 'Test origin', iata: 'TST' }, scheduledTime: { utc: '2026-10-25 00:30' }, revisedTime: { utc: '2026-10-25T01:30:00Z' } } }],
  departures: [{ number: 'TEST 2', status: 'FutureStatus', departure: { scheduledTime: { utc: '2026-10-25T02:00:00Z' } }, arrival: { airport: { name: 'Test destination', iata: 'DST' } } }],
};
const normalized = normalizeAirportFlights(fixture, '2026-10-25T00:00:00Z');
assert.equal(normalized.arrivals[0].scheduled, '2026-10-25T00:30:00.000Z');
assert.equal(normalized.arrivals[0].status, 'Canceled');
assert.equal(normalized.departures[0].airportCode, 'DST');
assert.equal(normalized.departures[0].status, 'Unknown');
assert.throws(() => normalizeAirportFlights({ error: 'upstream' }, 'now'));
const time = value => new Intl.DateTimeFormat('en-GB', { timeZone: 'Atlantic/Madeira', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
assert.equal(time(normalized.arrivals[0].scheduled), '01:30');
assert.equal(time(normalized.arrivals[0].revised), '01:30'); // DST fallback: dates use instants, not a fixed UTC offset.
for (const locale of ['en', 'pt', 'de', 'fr', 'es', 'pl', 'uk']) {
  const text = airportFlightText(locale);
  assert.ok(Object.values(text).every(Boolean));
  for (const status of flightStatuses) assert.ok(text.statuses[status]);
}
function freshHandler() {
  delete require.cache[require.resolve('../pages/api/airport-flights.ts')];
  return require('../pages/api/airport-flights.ts').default;
}
async function call(handler, method = 'GET') {
  const response = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  await handler({ method, query: {} }, response);
  return response;
}
(async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.AERODATABOX_RAPIDAPI_KEY;
  try {
    delete process.env.AERODATABOX_RAPIDAPI_KEY;
    global.fetch = async () => { throw new Error('Must not request provider without key'); };
    assert.equal((await call(freshHandler())).code, 503);
    assert.equal((await call(freshHandler(), 'POST')).code, 405);
    process.env.AERODATABOX_RAPIDAPI_KEY = 'test-only-not-a-secret';
    let requests = 0;
    global.fetch = async (url, options) => {
      requests++;
      assert.ok(url.startsWith('https://aerodatabox.p.rapidapi.com/flights/airports/iata/FNC?'));
      assert.equal(options.headers['X-RapidAPI-Host'], 'aerodatabox.p.rapidapi.com');
      return { ok: true, json: async () => fixture };
    };
    const handler = freshHandler();
    const [first, second] = await Promise.all([call(handler), call(handler)]);
    assert.equal(first.code, 200);
    assert.equal(second.code, 200);
    await call(handler);
    assert.equal(requests, 1);
    assert.ok(!JSON.stringify(first.body).includes('test-only-not-a-secret'));
    global.fetch = async () => { requests++; return { ok: false, status: 429 }; };
    const failing = freshHandler();
    const before = requests;
    assert.equal((await call(failing)).code, 503);
    assert.equal((await call(failing)).code, 503);
    assert.equal(requests - before, 1);
    console.log('PASS: provider contract, Madeira DST, seven locales, no-key state, method guard, cache, concurrent requests and provider failure cooldown. No live provider calls made.');
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.AERODATABOX_RAPIDAPI_KEY;
    else process.env.AERODATABOX_RAPIDAPI_KEY = originalKey;
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
