const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, file);
}
require.extensions['.css'] = (mod) => { mod.exports = {}; };

const { cameras } = require('../components/cameraData.ts');
const legacyHandler = require('../pages/api/camera-snapshot.ts').default;
const pathHandler = require('../pages/api/camera-snapshot/[id].ts').default;
const snapshotCameras = cameras.filter(camera => !camera.youtubeId);
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '../lib/i18n/TranslationProvider') return { useText: () => ({ translate: text => text }) };
  if (request === '../lib/i18n/useMessages') return { useMessages: () => ({
    locale: 'en', siteLocale: 'en', messages: { cameraCard: {
      liveStreamTitleSuffix: 'live stream', openLiveCamera: 'Open live camera', streamOnSource: 'Watch on the source website',
    } },
  }) };
  return originalLoad.call(this, request, parent, isMain);
};
const CameraCard = require('../components/CameraCard.tsx').default;
Module._load = originalLoad;

const originalFetch = global.fetch;
const originalNow = Date.now;
let now = originalNow();
Date.now = () => now;
let upstreamCalls = 0;
let failure = '';
global.fetch = async (input) => {
  upstreamCalls++;
  if (failure === 'network') throw new Error('Source offline');
  const url = new URL(String(input));
  const isImage = url.pathname.includes('/load/');
  const slug = url.pathname.split('/').pop();
  if (!isImage) {
    if (failure === 'page') return new Response('Unavailable', { status: 503 });
    if (failure === 'missing') return new Response('<html>No camera image</html>');
    return new Response(`<img id="webcam_image" src="//www.netmadeira.com/webcams-madeira/load/netmadeira/${slug}">`);
  }
  if (failure === 'image') return new Response('Unavailable', { status: 503 });
  if (failure === 'non-image') return new Response('<html>Source error</html>', { headers: { 'Content-Type': 'text/html' } });
  return new Response(Buffer.from(`snapshot:${slug}`), { headers: { 'Content-Type': 'image/jpeg' } });
};

async function originResponse(url, method = 'GET') {
  const parsed = new URL(url, 'https://example.test');
  const pathId = parsed.pathname.split('/')[3];
  const query = {};
  for (const name of parsed.searchParams.keys()) {
    const values = parsed.searchParams.getAll(name);
    query[name] = values.length === 1 ? values[0] : values;
  }
  if (pathId) query.id = decodeURIComponent(pathId);
  const result = { headers: {}, code: 200 };
  const response = {
    setHeader(name, value) { result.headers[name.toLowerCase()] = value; return response; },
    status(code) { result.code = code; return response; },
    json(body) { result.body = body; return response; },
    send(body) { result.body = body; return response; },
    end() { return response; },
  };
  await (pathId ? pathHandler : legacyHandler)({ method, query }, response);
  return result;
}

// Model Netlify's observed framework-only default variation, plus a cache that
// ignores all query parameters. Neither may mix cameras rendered by the cards.
function edgeCache(ignoreQuery = false) {
  const rules = new Map();
  const stored = new Map();
  const keyFor = (url) => {
    const params = ignoreQuery ? [] : (rules.get(url.pathname) || ['__nextDataReq', '_rsc']);
    return JSON.stringify([url.pathname, params.map(name => [name, url.searchParams.get(name)])]);
  };
  return async (path) => {
    const url = new URL(path, 'https://example.test');
    const cached = stored.get(keyFor(url));
    if (cached) return cached;
    const response = await originResponse(path);
    const queryRule = response.headers['netlify-vary']?.match(/(?:^|,\s*)query=([^,]+)/)?.[1];
    if (queryRule && !rules.has(url.pathname)) rules.set(url.pathname, queryRule.split('|'));
    if (response.code === 200 && !response.headers['cache-control'].includes('no-store')) stored.set(keyFor(url), response);
    return response;
  };
}

(async () => {
  const legacyEdge = edgeCache();
  const pathOnlyEdge = edgeCache(true);
  const paths = new Set();
  for (const camera of snapshotCameras) {
    const markup = renderToStaticMarkup(React.createElement(CameraCard, { camera }));
    const source = markup.match(/<img\b[^>]*\bsrc="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&');
    assert.ok(source, `${camera.id}: the card must request a preview`);
    paths.add(new URL(source, 'https://example.test').pathname);
    for (const result of [await pathOnlyEdge(source), await legacyEdge(`/api/camera-snapshot?id=${camera.id}&t=0`)]) {
      assert.equal(result.code, 200);
      assert.equal(result.headers['x-camera-id'], camera.id);
      assert.equal(result.body.toString(), `snapshot:${new URL(camera.sourceUrl).pathname.split('/').pop()}`);
    }
  }
  assert.equal(paths.size, snapshotCameras.length, 'Each camera must have its own cache path');
  assert.equal(upstreamCalls, snapshotCameras.length * 2, 'Both API paths share the existing per-camera memory cache');
  const beforeHit = upstreamCalls;
  await legacyEdge(`/api/camera-snapshot?id=${snapshotCameras[0].id}&t=0`);
  assert.equal(upstreamCalls, beforeHit, 'Repeated requests reuse the cached image');
  now += 300_001;
  await legacyEdge(`/api/camera-snapshot?id=${snapshotCameras[0].id}&t=1`);
  assert.equal(upstreamCalls, beforeHit + 2, 'A new five-minute refresh bucket loads a fresh frame');

  for (const reason of ['page', 'missing', 'image', 'non-image', 'network']) {
    failure = reason;
    const result = await originResponse('/api/camera-snapshot/machico?t=2');
    assert.equal(result.code, 502, reason);
    for (const header of ['cache-control', 'cdn-cache-control', 'netlify-cdn-cache-control']) assert.equal(result.headers[header], 'no-store');
    assert.equal(result.headers['netlify-vary'], 'query=id|t|v', 'Errors preserve the cache variation policy');
  }
  failure = '';
  const callsBeforeInvalid = upstreamCalls;
  for (const path of ['/api/camera-snapshot/unknown', '/api/camera-snapshot', '/api/camera-snapshot?id=machico&id=pico-do-arieiro']) {
    assert.equal((await originResponse(path)).code, 404);
  }
  assert.equal((await originResponse('/api/camera-snapshot/madeira-airport')).code, 400);
  assert.equal((await originResponse('/api/camera-snapshot/machico', 'POST')).code, 405);
  assert.equal(upstreamCalls, callsBeforeInvalid, 'Invalid requests must not fetch upstream');
  const retryEdge = edgeCache();
  failure = 'network';
  assert.equal((await retryEdge('/api/camera-snapshot/machico')).code, 502);
  failure = '';
  assert.equal((await retryEdge('/api/camera-snapshot/machico')).code, 200, 'An outage must not poison the cache');
  const head = await originResponse('/api/camera-snapshot/machico', 'HEAD');
  assert.equal(head.code, 200);
  assert.equal(head.body, undefined);
  assert.equal(head.headers['x-camera-id'], 'machico');
  const beforeConcurrent = upstreamCalls;
  const concurrent = await Promise.all([originResponse('/api/camera-snapshot/sao-jorge'), originResponse('/api/camera-snapshot?id=sao-jorge')]);
  assert.equal(upstreamCalls, beforeConcurrent + 2, 'Concurrent requests share one upstream fetch for their camera');
  assert.deepEqual(concurrent[0].body, concurrent[1].body);
  const youtube = cameras.find(camera => camera.youtubeId);
  const youtubeMarkup = renderToStaticMarkup(React.createElement(CameraCard, { camera: youtube }));
  assert.ok(youtubeMarkup.includes(`https://www.youtube.com/embed/${youtube.youtubeId}`));
  assert.ok(!youtubeMarkup.includes('/api/camera-snapshot'), 'YouTube cards retain their player');
  console.log(`PASS: ${snapshotCameras.length} separate camera previews; both CDN cache modes, five-minute memory cache, concurrent requests, failures, recovery, HEAD and YouTube verified.`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => {
  global.fetch = originalFetch;
  Date.now = originalNow;
});
