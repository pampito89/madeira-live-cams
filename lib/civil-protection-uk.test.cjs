const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, filename);
const { parseNewsFeed } = require('./civilProtectionNews.ts');
const adapter = require('./events/translate.ts');
adapter.translatedTitle = async () => null;
const { ukrainianArticle } = require('./civilProtectionUkrainian.ts');
(async () => {
  const articles = parseNewsFeed(fs.readFileSync(path.join(__dirname, '../data/civil-protection-feed.xml'), 'utf8'));
  for (const source of articles) {
    const translated = await ukrainianArticle(source);
    assert.equal(translated.contentLanguage, 'uk');
    assert.equal(translated.translationKind, 'edited');
    assert.match(translated.title, /[іїєґ]/i);
    assert.equal(translated.sourceUrl, source.sourceUrl);
    assert.equal(translated.publishedAt, source.publishedAt);
    assert.ok(translated.paragraphs.length > 4);
  }
  const notice = await ukrainianArticle(articles[0]);
  assert.ok(notice.paragraphs.some(text => text.includes('110 км/год')));
  assert.ok(notice.paragraphs.some(text => text.includes('90 км/год')));
  const changed = await ukrainianArticle({ ...articles[0], paragraphs: ['Corrected official notice'] });
  assert.equal(changed.translationKind, 'original');
  assert.deepEqual(changed.paragraphs, ['Corrected official notice']);
  console.log('PASS: all five Ukrainian articles, original attribution and dates, wind values, corrected-source invalidation and honest fallback.');
})().catch(error => { console.error(error); process.exitCode = 1; });
