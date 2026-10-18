const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, file);
const { createTranslator } = require('./translation.ts');
const { localizeStructuredData } = require('./structuredData.ts');
const { formatDuration } = require('./duration.ts');
const t = createTranslator({ Hello: 'Bonjour', 'Hello __VAR_0__': 'Bonjour __VAR_0__',
  '__VAR_0__ and __VAR_1__': '__VAR_1__ et __VAR_0__', 'Goodbye': 'Au revoir' });
assert.equal(t(' Hello '), ' Bonjour ');
assert.equal(t('Hello\nGoodbye'), 'Bonjour\nAu revoir');
assert.equal(t.format('Hello __VAR_0__', ''), 'Bonjour ');
assert.equal(t.format('__VAR_0__ and __VAR_1__', 'Hello', 'Goodbye'), 'Au revoir et Bonjour');
assert.equal(t('https://example.com/Hello'), 'https://example.com/Hello');
assert.equal(t('/Hello'), '/Hello');
assert.equal(t('Unknown'), 'Unknown');
const reactNode = { type: 'span', props: { children: 'Hello' } };
assert.equal(t(reactNode), reactNode);
assert.deepEqual(t(['Hello', 2, reactNode]), ['Bonjour', 2, reactNode]);
assert.equal(createTranslator({ Hello: 'Hallo' })('Hello'), 'Hallo');
assert.equal(t('Hello'), 'Bonjour');
const schema = { '@type': 'Place', name: 'Hello', description: 'Goodbye', url: 'https://example.com/Hello', geo: { latitude: 32 } };
assert.deepEqual(localizeStructuredData(schema, t), { ...schema, name: 'Bonjour', description: 'Au revoir' });
assert.equal(schema.name, 'Hello');
assert.match(formatDuration(90, 'de', 'long'), /Stunde.*Minuten/);
assert.match(formatDuration(90, 'pl', 'long'), /godzina.*minut/);
const out = path.join(__dirname, 'catalogs');
const sources = { ...require('./catalogs/source.json'), ...require('./catalogs/source-extra.json') };
const variables = s => [...s.matchAll(/__VAR_\d+__/g)].map(m => m[0]).sort().join(',');
for (const locale of ['pt', 'de', 'fr', 'es', 'pl']) {
  const file = path.join(out, `content.${locale}.json`);
  const content = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const missing = Object.keys(sources).filter(id => !content[id]);
  for (const [id, value] of Object.entries(content)) {
    assert.ok(sources[id], `Unknown source ${locale}/${id}`);
    assert.equal(typeof value, 'string');
    assert.ok(value.trim(), `Empty translation ${locale}/${id}`);
    assert.equal(variables(value), variables(sources[id]), `Placeholder mismatch ${locale}/${id}`);
  }
  console.log(`${locale}: ${Object.keys(content).length}/${Object.keys(sources).length}, missing ${missing.length}`);
  if (process.argv.includes('--complete')) assert.equal(missing.length, 0, `Incomplete ${locale}`);
}
console.log('Translator isolation, templates, line breaks, Schema.org, durations and catalog placeholders: PASS');
