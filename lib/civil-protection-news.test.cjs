const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const filename = path.join(__dirname, 'civilProtectionNews.ts');
const fixture = fs.readFileSync(path.join(__dirname, '../data/civil-protection-feed.xml'), 'utf8');
function load() {
  const instance = new Module(filename);
  instance.filename = filename;
  instance.paths = module.paths;
  const originalRequire = instance.require.bind(instance);
  instance.require = name => name === 'node:fs' ? { promises: {
    readFile: async file => { if (file.endsWith('.xml')) return fixture; throw new Error('No cache'); },
    mkdir: async () => {}, writeFile: async () => {}, rename: async () => {},
  } } : originalRequire(name);
  instance._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, filename);
  return instance.exports;
}
(async () => {
  const api = load();
  const articles = api.parseNewsFeed(fixture);
  assert.ok(articles.length >= 2);
  assert.equal(articles[0].id, '2157');
  assert.ok(articles[0].paragraphs.some(text => text.includes('110 km/h')));
  assert.throws(() => api.parseNewsFeed('<rss><channel /></rss>'));
  assert.throws(() => api.parseNewsFeed(fixture.replaceAll('https://procivmadeira.pt/pt/10-noticias/', 'https://attacker.example/pt/10-noticias/')));
  assert.throws(() => api.parseNewsFeed('<!DOCTYPE rss>' + fixture));
  assert.deepEqual(api.newsParagraphs('<script>alert(1)</script><p>A &amp; B</p><p>&#x1F30D;</p>'), ['A & B', '🌍']);
  const originalFetch = global.fetch;
  try {
    let calls = 0;
    global.fetch = async () => { calls++; return { ok: true, text: async () => fixture }; };
    const [first, second] = await Promise.all([api.getCivilProtectionNews(), api.getCivilProtectionNews()]);
    assert.equal(calls, 1);
    assert.equal(first.stale, false);
    assert.equal(second.articles.length, first.articles.length);
    await api.getCivilProtectionNews();
    assert.equal(calls, 1);
    global.fetch = async () => { throw new Error('Offline'); };
    const offline = await load().getCivilProtectionNews();
    assert.equal(offline.stale, true);
    assert.equal(offline.articles[0].id, '2157');
  } finally { global.fetch = originalFetch; }
  console.log('PASS: official-only source, real RSS content, malformed feed, safe text, deduplication, cache and offline fallback.');
})().catch(error => { console.error(error); process.exitCode = 1; });
