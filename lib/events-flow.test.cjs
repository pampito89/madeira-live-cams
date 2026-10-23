const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const ts = require('typescript');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, file);
// Isolate cache and budget tests from the running site's data.
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'madeira-events-test-'));
process.chdir(sandbox);
delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_TOKEN; delete process.env.VERCEL;
let calls = 0; let failed = false; let translationCalls = 0;
const today = new Date().toISOString().slice(0, 10);
const [year, month, day] = today.split('-');
const html = `<div class="gt-event-style-3"><div class="gt-title"><a href="https://eventsmadeira.com/en/event/test/">Test Festival</a></div><div class="gt-category">Music</div><div class="gt-date"><span>${day}/${month}/${year}</span></div><a href="https://eventsmadeira.com/en/location/funchal/">Funchal</a>`;
global.fetch = async (url) => {
 if (String(url).includes('mymemory')) { translationCalls++; return new Response(JSON.stringify({responseStatus:200,responseData:{translatedText:'Тестовий фестиваль'}})); }
 calls++; if (failed) throw new Error('Offline');
 return new Response(String(url).includes('amak.pt') ? JSON.stringify({events:[],total_pages:1}) : html);
};
const { getEventFeed } = require('./events/feed.ts');
const { readCache, writeCache, reserveTranslation } = require('./events/cache.ts');
const { translatedTitle } = require('./events/translate.ts');
(async () => {
 const first = await getEventFeed('en'); assert.equal(first.events.length, 1); assert.equal(calls, 2); assert.ok(first.sources.every(source=>source.status==='fresh'));
 const second = await getEventFeed('en'); assert.equal(calls, 2); assert.equal(second.sources[0].fetchedAt, first.sources[0].fetchedAt);
 const old = await readCache('source:eventsmadeira'); old.fetchedAt = new Date(Date.now()-31*60_000).toISOString(); await writeCache('source:eventsmadeira',old);
 failed = true;
 const outage = await getEventFeed('en'); assert.equal(outage.sources[0].status,'stale'); assert.equal(outage.events.length,1);
 const afterFailure = calls; await getEventFeed('en'); assert.equal(calls,afterFailure,'Retry cooldown must avoid hammering an unavailable source');
 const expired = await readCache('source:eventsmadeira'); expired.fetchedAt=new Date(Date.now()-8*86400000).toISOString(); await writeCache('source:eventsmadeira',expired);
 const gone = await getEventFeed('en'); assert.equal(gone.sources[0].status,'unavailable'); assert.equal(gone.events.length,0);
 assert.equal(await translatedTitle('Test Festival','en','uk'),'Тестовий фестиваль');
 assert.equal(await translatedTitle('Test Festival','en','uk'),'Тестовий фестиваль'); assert.equal(translationCalls,1,'Cached translations must not consume quota again');
 const reserves = await Promise.all([reserveTranslation(3000),reserveTranslation(3000)]); assert.equal(reserves.filter(Boolean).length,1,'Concurrent reservations must respect the daily budget');
 console.log('PASS: live import boundary, persistent cache reuse, per-source outage, cooldown, stale expiry, translation reuse, concurrent budget.');
})().catch(error=>{console.error(error);process.exitCode=1;});
