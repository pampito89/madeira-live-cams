const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const { normalizeAirportWeather, assessAirportWeather } = require('./airportWeather.ts');
const { airportWeatherText } = require('./i18n/airportWeather.ts');
const now = Date.parse('2026-10-18T07:10:00Z');
const fixture = { icaoId: 'LPMA', obsTime: Date.parse('2026-10-18T07:00:00Z') / 1000, temp: 21, wdir: 350, wspd: 10, visib: '6+', fltCat: 'VFR', rawOb: 'METAR LPMA 180700Z 35010KT 9999 FEW015 21/16 Q1019' };
const data = normalizeAirportWeather([fixture], now);
assert.equal(data.visibilityKm, 10);
assert.equal(data.visibilityAtLeast, true);
assert.equal(data.gustKnots, null);
assert.equal(assessAirportWeather(data, now).level, 'green');
assert.equal(assessAirportWeather({ ...data, windKnots: 20 }, now).level, 'yellow');
assert.equal(assessAirportWeather({ ...data, gustKnots: 40 }, now).level, 'red');
assert.equal(assessAirportWeather({ ...data, category: 'IFR' }, now).level, 'red');
assert.equal(assessAirportWeather({ ...data, phenomena: 'VCTS' }, now).level, 'red');
assert.equal(assessAirportWeather({ ...data, phenomena: '-RA' }, now).level, 'yellow');
assert.equal(assessAirportWeather({ ...data, visibilityKm: 0.5 }, now).level, 'red');
assert.equal(assessAirportWeather({ ...data, windKnots: null }, now).level, 'unknown');
assert.equal(assessAirportWeather({ ...data, category: null }, now).level, 'unknown');
assert.equal(assessAirportWeather(data, now + 91 * 60_000).level, 'unknown');
assert.equal(assessAirportWeather(data, now - 30 * 60_000).level, 'unknown');
assert.throws(() => normalizeAirportWeather([{ ...fixture, icaoId: 'LPPT' }], now));
assert.throws(() => normalizeAirportWeather([], now));
const metric = normalizeAirportWeather([{ ...fixture, rawOb: '', visib: 2 }], now);
assert.equal(metric.visibilityKm, 3.218688);
assert.equal(assessAirportWeather(metric, now).level, 'yellow');
const latest = normalizeAirportWeather([fixture, { ...fixture, obsTime: fixture.obsTime + 60, temp: 22 }], now);
assert.equal(latest.temperature, 22);
for (const locale of ['en', 'pt', 'de', 'fr', 'es', 'pl', 'uk']) {
  const t = airportWeatherText(locale);
  assert.ok(Object.values(t).every(Boolean));
  assert.equal(Object.keys(t.levels).length, 4);
  assert.equal(Object.keys(t.reasons).length, 7);
}
async function call(handler, method = 'GET') {
  const response = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  await handler({ method }, response);
  return response;
}
function freshHandler() { delete require.cache[require.resolve('../pages/api/airport-weather.ts')]; return require('../pages/api/airport-weather.ts').default; }
(async () => {
  const original = global.fetch;
  try {
    let requests = 0;
    global.fetch = async url => { requests++; assert.equal(url, 'https://aviationweather.gov/api/data/metar?ids=LPMA&format=json'); return { ok: true, status: 200, json: async () => [fixture] }; };
    const handler = freshHandler();
    const responses = await Promise.all([call(handler), call(handler)]);
    assert.ok(responses.every(r => r.code === 200));
    await call(handler);
    assert.equal(requests, 1);
    assert.equal((await call(handler, 'POST')).code, 405);
    global.fetch = async () => { requests++; return { ok: true, status: 204 }; };
    const failed = freshHandler();
    const before = requests;
    assert.equal((await call(failed)).code, 503);
    assert.equal((await call(failed)).code, 503);
    assert.equal(requests - before, 1);
    console.log('PASS: METAR normalization, units, freshness, missing fields, weather levels, seven languages, cache, concurrent requests, missing data and retry cooldown. No external calls.');
  } finally { global.fetch = original; }
})().catch(error => { console.error(error); process.exitCode = 1; });
