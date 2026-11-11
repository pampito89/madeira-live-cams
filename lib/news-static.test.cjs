const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const manifest = require(path.join(root, '.next/prerender-manifest.json'));
const fs = require('node:fs');
for (const locale of ['en', 'pt', 'de', 'fr', 'es', 'pl', 'uk']) {
  for (const route of ['/news', '/news/rtp-02cbc87bc4e6', '/news/2157']) {
    const key = `/${locale}${route}`;
    const page = manifest.routes[key];
    assert.ok(page, `Missing pre-rendered page: ${key}`);
    assert.equal(page.initialRevalidateSeconds, 60, `Missing background refresh: ${key}`);
    const html = fs.readFileSync(path.join(root, '.next/server/pages', `${key}.html`), 'utf8');
    assert.ok(html.includes('__NEXT_DATA__'), `Missing pre-rendered content: ${key}`);
    const data = JSON.parse(html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]);
    assert.equal(data.gsp, true);
    assert.equal(data.gssp, undefined, `Request-time rendering regressed: ${key}`);
    const props = data.props.pageProps;
    const articles = props.article ? [props.article] : props.snapshot.articles;
    assert.ok(articles.length);
    assert.ok(articles.every(item => item.contentLanguage === locale), `Wrong content language: ${key}`);
  }
}
assert.equal(manifest.dynamicRoutes['/news/[id]'].fallback, null, 'New articles must remain discoverable');
console.log('PASS: 21 multilingual feed/current/archive pages pre-rendered, translated and revalidated; new articles supported.');
