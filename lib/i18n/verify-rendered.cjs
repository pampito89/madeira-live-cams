const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const output = path.join(root, '.next/server/pages');
const languages = ['en', 'pt', 'de', 'fr', 'es', 'pl', 'uk'];
const sources = { ...require('./catalogs/source.json'), ...require('./catalogs/source-extra.json') };
const normalize = text => text.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const issues = [];
let count = 0;
function inspect(file) {
  const relative = path.relative(output, file).replace(/\\/g, '/');
  const locale = relative.split(/[/.]/)[0];
  if (!languages.includes(locale)) return;
  if (/(?:^|\/)(?:404|500)\.html$/.test(relative)) return;
  const html = fs.readFileSync(file, 'utf8');
  const catalog = require(`./catalogs/${locale}.json`);
  const visible = normalize(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' '));
  count++;
  const report = message => issues.push(`${relative}: ${message}`);
  const htmlLang = locale === 'pt' ? 'pt-PT' : locale;
  if (!html.includes(`lang="${htmlLang}"`)) report('Incorrect document language');
  if (!/<title>[^<]+<\/title>/.test(html)) report('Missing page title');
  if (!/<meta name="description" content="[^"]+"/.test(html)) report('Missing description');
  if (!/<link rel="canonical" href="https:\/\/madeiralivecams.com[^"?]*"/.test(html)) report('Missing canonical');
  if (/__VAR_\d+__/.test(visible)) report('Unresolved translation placeholder');
  if (locale === 'en') return;
  for (const [id, text] of Object.entries(sources)) {
    const key = normalize(text);
    if (key.length <= 45 || key.includes('__VAR_') || !catalog[key] || normalize(catalog[key]) === key) continue;
    if (visible.includes(key)) report(`Untranslated source ${id}: ${key.slice(0, 90)}`);
  }
}
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) inspect(file);
  }
}
walk(output);
assert.ok(count > 100, 'Run the production build before this audit');
if (issues.length) console.error(issues.join('\n'));
assert.equal(issues.length, 0, `${issues.length} rendered-page issues`);
console.log(`PASS: ${count} generated pages checked for document language, metadata, unresolved placeholders and untranslated source paragraphs.`);
