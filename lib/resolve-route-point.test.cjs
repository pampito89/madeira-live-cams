const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');
const source = path.join(__dirname, '../pages/api/resolve-route-point.ts');
const compiled = ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const loaded = new Module(source, module);
loaded._compile(compiled, source);
const handler = loaded.exports.default;
const originalFetch = global.fetch;
const originalKey = process.env.GOOGLE_MAPS_API_KEY;
async function call(input, mockFetch, method = 'POST') {
  global.fetch = mockFetch || (() => { throw new Error('Unexpected network request'); });
  process.env.GOOGLE_MAPS_API_KEY = 'test-key';
  const result = { status: 200, headers: {} };
  const response = {
    setHeader(key, value) { result.headers[key] = value; },
    status(status) { result.status = status; return this; },
    json(body) { result.body = body; return this; },
  };
  try { await handler({ method, body: { url: input } }, response); return result; }
  finally { global.fetch = originalFetch; if (originalKey === undefined) delete process.env.GOOGLE_MAPS_API_KEY; else process.env.GOOGLE_MAPS_API_KEY = originalKey; }
}
const place = { id: 'test-place', displayName: { text: 'Alforno Madeira' }, location: { latitude: 32.729779, longitude: -16.7716615 }, googleMapsUri: 'https://maps.google.com/?cid=12285957632149162576' };
const placeResponse = () => Response.json({ places: [place] });

test('mobile link matches exact business CID even when another branch ranks first', async () => {
  const calls = [];
  const query = 'Alforno Madeira, Estr. de Tristão Vaz Teixeira ER109 75, 9200-121 Machico, Португалія';
  const result = await call('https://maps.app.goo.gl/Jyw2PFhTFpx9rLjG8?g_st=ic', async (url, options) => {
    calls.push(String(url));
    if (calls.length === 1) return new Response(null, { status: 302, headers: { location: `https://maps.google.com?q=${encodeURIComponent(query)}&ftid=0xc60632c656beec7:0xaa807d5f65c00a50` } });
    assert.equal(String(url), 'https://places.googleapis.com/v1/places:searchText');
    assert.equal(JSON.parse(options.body).textQuery, query);
    return Response.json({ places: [{ ...place, googleMapsUri: 'https://maps.google.com/?cid=15190683561558493138', location: { latitude: 32.63, longitude: -16.93 } }, place] });
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.latitude, 32.729779);
  assert.equal(calls.length, 2);
});
test('mismatching CID does not silently import another business', async () => {
  const result = await call('https://maps.google.com?q=Alforno&cid=123', async () => placeResponse());
  assert.equal(result.status, 422);
});
test('explicit coordinates need no external calls', async () => {
  for (const value of ['32.7, -16.7', 'https://www.google.com/maps?q=32.7,-16.7', 'https://www.google.com/maps/place/Test/data=!3d32.7!4d-16.7', 'https://www.google.com/maps/place/Test/data=%213d32.7%214d-16.7']) {
    const result = await call(value);
    assert.equal(result.status, 200, value);
    assert.equal(result.body.latitude, 32.7);
  }
});
test('selected business viewport is not used as its coordinates', async () => {
  let requested = false;
  const result = await call('https://www.google.com/maps/place/Alforno+Madeira/@0,0,15z', async () => { requested = true; return placeResponse(); });
  assert.equal(requested, true);
  assert.equal(result.body.latitude, 32.729779);
});
test('explicit place ID uses Place Details', async () => {
  const result = await call('https://www.google.com/maps/search/?api=1&query=Restaurant&query_place_id=ChIJtest', async (url) => {
    assert.equal(url, 'https://places.googleapis.com/v1/places/ChIJtest');
    return Response.json(place);
  });
  assert.equal(result.status, 200);
});
test('unsafe input and redirect targets are blocked before fetching', async () => {
  for (const url of ['http://maps.google.com?q=Test', 'https://evil.example?q=Test', 'https://maps.google.com:444?q=Test', 'https://user:pass@maps.google.com?q=Test']) assert.equal((await call(url)).status, 400);
  for (const location of ['https://127.0.0.1/private', 'http://maps.google.com?q=Test', 'https://maps.google.com.evil.example/']) {
    let count = 0;
    const result = await call('https://maps.app.goo.gl/test', async () => { count++; return new Response(null, { status: 302, headers: { location } }); });
    assert.equal(result.status, 400);
    assert.equal(count, 1);
  }
});
test('blocked API, empty results and ambiguous results never invent a point', async () => {
  for (const [response, status] of [[Response.json({}, { status: 403 }), 503], [Response.json({ places: [] }), 422], [Response.json({ places: [{}, {}] }), 422]]) {
    const result = await call('https://maps.google.com?q=Alforno', async () => response);
    assert.equal(result.status, status);
    assert.equal(result.body.latitude, undefined);
    assert.equal(JSON.stringify(result.body).includes('test-key'), false);
  }
});
test('redirect loops are bounded', async () => {
  let count = 0;
  const result = await call('https://maps.app.goo.gl/test', async () => { count++; return new Response(null, { status: 302, headers: { location: '/test' } }); });
  assert.equal(result.status, 422);
  assert.equal(count, 5);
});
test('empty input and unsupported methods are rejected', async () => {
  assert.equal((await call('')).status, 400);
  const result = await call('32, -16', undefined, 'GET');
  assert.equal(result.status, 405);
  assert.equal(result.headers.Allow, 'POST');
});
test('plain address support remains available', async () => {
  const result = await call('Machico, Portugal', async (url) => {
    assert.equal(new URL(url).hostname, 'nominatim.openstreetmap.org');
    return Response.json([{ lat: '32.7', lon: '-16.7' }]);
  });
  assert.equal(result.status, 200);
});
