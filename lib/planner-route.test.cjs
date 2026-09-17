const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');

function load(file) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { exports, AbortSignal, fetch, require: name => load(path.resolve(path.dirname(file), name + '.ts')) });
  return exports;
}
const { calculatePlannerRoute, resolvePlannerLocation } = load(path.join(__dirname, 'calculatePlannerRoute.ts'));
const { locations } = load(path.join(__dirname, '../data/plannerLocations.ts'));
const start = [32.72, -16.8], airport = [32.6919, -16.7745], viewpoint = [32.8225, -17.0368];
const stop = { id: 'viewpoint', slug: 'miradouro-sao-cristovao', durationMinutes: 30, arrivalTime: '09:30' };
const reply = (durationMinutes, status = 200) => ({ ok: status === 200, status, json: async () => ({ durationMinutes }) });
const options = { start, end: airport, departure: '09:00', stops: [stop], pointForStop: async () => viewpoint };

test('São Cristóvão to the airport is included with its own travel and arrival time', async () => {
  const calls = [];
  const result = await calculatePlannerRoute({ ...options, request: async (_url, config) => {
    calls.push(JSON.parse(config.body)); return reply(calls.length === 1 ? 42 : 51);
  } });
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], { origin: { latitude: viewpoint[0], longitude: viewpoint[1] }, destination: { latitude: airport[0], longitude: airport[1] } });
  assert.equal(result.stops[0].arrivalTime, '09:45');
  assert.equal(result.returnTravelMinutes, 55);
  assert.equal(result.arrival, '11:10');
  assert.equal(stop.arrivalTime, '09:30');
});

test('direct transfers, airport starts, custom endpoints and return to start all include the destination', async () => {
  for (const [origin, end] of [[start, airport], [airport, start], [start, [32.7, -17.1]], [start, start]]) {
    const result = await calculatePlannerRoute({ ...options, start: origin, end, stops: [], request: async () => reply(17) });
    assert.equal(result.arrival, origin === end ? '09:00' : '09:20');
  }
  const roundTrip = await calculatePlannerRoute({ ...options, end: start, request: async () => reply(17) });
  assert.equal(roundTrip.arrival, '10:10');
});

test('identical successive points cost zero minutes and make no route request', async () => {
  const result = await calculatePlannerRoute({ ...options, start: airport, pointForStop: async () => airport, request: async () => assert.fail('Unnecessary request') });
  assert.equal(result.returnTravelMinutes, 0);
  assert.equal(result.arrival, '09:30');
});

test('zero-minute provider responses remain zero and midnight arrival wraps correctly', async () => {
  const zero = await calculatePlannerRoute({ ...options, request: async () => reply(0) });
  assert.equal(zero.returnTravelMinutes, 0);
  const midnight = await calculatePlannerRoute({ ...options, departure: '23:30', request: async () => reply(20) });
  assert.equal(midnight.arrival, '00:40');
});

test('failed final legs never produce a successful itinerary with a fabricated duration', async () => {
  for (const failure of [reply(undefined, 502), reply(-1), reply(NaN), reply('20'), reply(undefined, 429)]) {
    let count = 0;
    await assert.rejects(calculatePlannerRoute({ ...options, request: async () => ++count === 1 ? reply(10) : failure }));
    assert.equal(count, 2);
    assert.equal(stop.arrivalTime, '09:30');
  }
});

test('an intermediate failure stops calculation before requesting the wrong final leg', async () => {
  let count = 0;
  await assert.rejects(calculatePlannerRoute({ ...options, request: async () => { count++; return reply(undefined, 429); } }), /limit/);
  assert.equal(count, 1);
});

test('missing coordinates are resolved once and reused, including the last stop before the airport', async () => {
  const location = locations.find(item => item.slug === stop.slug), cache = new Map();
  let count = 0;
  const request = async (url, config) => {
    count++;
    assert.equal(url, '/api/resolve-route-point');
    assert.equal(JSON.parse(config.body).url, location.mapQuery);
    return { ok: true, json: async () => ({ latitude: viewpoint[0], longitude: viewpoint[1] }) };
  };
  assert.deepEqual(Array.from(await resolvePlannerLocation(location, {}, cache, request)), viewpoint);
  await resolvePlannerLocation(location, {}, cache, request);
  assert.equal(count, 1);
});

test('every catalogue location provides coordinates or a resolvable map query', async () => {
  for (const location of locations) {
    assert.ok(location.mapQuery.trim(), location.slug);
    const point = await resolvePlannerLocation(location, {}, new Map(), async (_url, config) => {
      assert.equal(JSON.parse(config.body).url, location.mapQuery);
      return { ok: true, json: async () => ({ latitude: start[0], longitude: start[1] }) };
    });
    assert.ok(point.every(Number.isFinite), location.slug);
  }
});

test('invalid and failed point resolution prevent routing and are never cached', async () => {
  for (const response of [{ ok: false, json: async () => ({}) }, { ok: true, json: async () => ({ latitude: 100, longitude: 0 }) }]) {
    const cache = new Map();
    await assert.rejects(resolvePlannerLocation({ slug: 'missing', mapQuery: 'Missing place' }, {}, cache, async () => response), /point/);
    assert.equal(cache.size, 0);
  }
});
