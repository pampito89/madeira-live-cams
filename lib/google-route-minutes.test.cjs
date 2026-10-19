const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load() {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(__dirname + '/googleRouteMinutes.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, AbortSignal, fetch, setTimeout, Error });
  return exports;
}
const origin = { latitude: 32.7416264, longitude: -16.7104624 };
const destination = { latitude: 32.742609, longitude: -16.7390724 };
const response = (status, duration = '411s') => ({ ok: status === 200, status, body: { cancel: async () => {} }, json: async () => ({ routes: [{ duration }] }) });

test('503 deadline then success retries with backoff and counts both attempts', async () => {
  const { googleRouteMinutes } = load();
  let calls = 0, reservations = 0; const waits = [];
  const result = await googleRouteMinutes(origin, destination, 'test', async () => reservations++, async () => response(++calls === 1 ? 503 : 200), async ms => waits.push(ms));
  assert.equal(result, 7); assert.equal(calls, 2); assert.equal(reservations, 2); assert.deepEqual(waits, [500]);
});

test('persistent temporary errors stop after three attempts and are never cached', async () => {
  const { googleRouteMinutes } = load(); let calls = 0;
  const request = async () => { calls++; return response(503); };
  for (let i = 0; i < 2; i++) await assert.rejects(googleRouteMinutes(origin, destination, 'test', async () => {}, request, async () => {}), /temporarily unavailable/);
  assert.equal(calls, 6);
});

test('successful directed legs are reused for ten minutes without consuming quota', async () => {
  const { googleRouteMinutes } = load(); let calls = 0, reservations = 0, now = 1000;
  const run = (a = origin, b = destination) => googleRouteMinutes(a, b, 'test', async () => reservations++, async () => { calls++; return response(200); }, async () => {}, () => now);
  await run(); await run(); assert.equal(calls, 1); assert.equal(reservations, 1);
  await run(destination, origin); assert.equal(calls, 2);
  now += 600001; await run(); assert.equal(calls, 3);
});

test('permanent provider failures and invalid durations are not retried', async () => {
  for (const reply of [response(400), response(403), response(429), response(200, 'invalid'), response(200, '-1s')]) {
    const { googleRouteMinutes } = load(); let calls = 0;
    await assert.rejects(googleRouteMinutes(origin, destination, 'test', async () => {}, async () => { calls++; return reply; }, async () => {}));
    assert.equal(calls, 1);
  }
});

test('quota exhaustion between attempts prevents another Google request', async () => {
  const { googleRouteMinutes, RouteServiceError } = load(); let calls = 0, reservations = 0;
  await assert.rejects(googleRouteMinutes(origin, destination, 'test', async () => { if (++reservations === 2) throw new RouteServiceError(429, 'limit'); }, async () => { calls++; return response(503); }, async () => {}), /limit/);
  assert.equal(calls, 1);
});

test('network timeout retries, and concurrent requests share the same calculation', async () => {
  const { googleRouteMinutes } = load(); let calls = 0, reservations = 0;
  const run = () => googleRouteMinutes(origin, destination, 'test', async () => reservations++, async () => {
    if (++calls === 1) { const error = new Error('timeout'); error.name = 'TimeoutError'; throw error; }
    return response(200);
  }, async () => {});
  assert.deepEqual(await Promise.all([run(), run()]), [7, 7]);
  assert.equal(calls, 2); assert.equal(reservations, 2);
});
