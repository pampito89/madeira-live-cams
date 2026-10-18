const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const out = path.join(__dirname, 'catalogs');
const langs = ['en', 'pt', 'de', 'fr', 'es', 'pl', 'uk'];
const catalogs = Object.fromEntries(langs.map(l => [l, {}]));
const pairs = new Map();
const cyrillic = /[а-яА-ЯіІїЇєЄ]/;
const normalize = value => value.replace(/\s+/g, ' ').trim();
function text(n) {
  if (!n) return undefined;
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text;
  if (ts.isTemplateExpression(n)) return n.head.text + n.templateSpans.map((s, i) => `__VAR_${i}__` + s.literal.text).join('');
}
const key = n => ts.isIdentifier(n) || ts.isStringLiteral(n) ? n.text : '';
function pair(en, uk) {
  if (!en || !uk || en === uk) return;
  if (!pairs.has(en)) pairs.set(en, new Set());
  pairs.get(en).add(uk);
  catalogs.en[uk] = en;
  catalogs.uk[en] = uk;
}
function objectValues(n) {
  return ts.isObjectLiteralExpression(n) ? Object.fromEntries(n.properties.filter(ts.isPropertyAssignment).map(p => [key(p.name), p.initializer])) : {};
}
function pairedNodes(a, b) {
  const av = text(a), bv = text(b);
  if (av && bv) {
    if (cyrillic.test(av) && !cyrillic.test(bv)) pair(bv, av);
    if (cyrillic.test(bv) && !cyrillic.test(av)) pair(av, bv);
  } else if (a && b && ts.isObjectLiteralExpression(a) && ts.isObjectLiteralExpression(b)) {
    const aa = objectValues(a), bb = objectValues(b);
    for (const k of Object.keys(aa)) if (bb[k]) pairedNodes(aa[k], bb[k]);
  } else if (a && b && ts.isArrayLiteralExpression(a) && ts.isArrayLiteralExpression(b)) {
    a.elements.forEach((v, i) => { if (b.elements[i]) pairedNodes(v, b.elements[i]); });
  }
}
function collect(n) {
  if (ts.isObjectLiteralExpression(n)) {
    const values = objectValues(n);
    pairedNodes(values.en, values.uk);
    if (values.en && langs.every(l => text(values[l]) !== undefined)) {
      for (const l of langs) catalogs[l][text(values.en)] = text(values[l]);
    }
  }
  if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 't' && n.arguments.length === 2) pairedNodes(n.arguments[0], n.arguments[1]);
  if (ts.isConditionalExpression(n)) pairedNodes(n.whenTrue, n.whenFalse);
  ts.forEachChild(n, collect);
}
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (!['api', 'catalogs'].includes(entry.name)) scan(file); }
    else if (/\.tsx?$/.test(file) && !file.endsWith('.d.ts')) collect(ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS));
  }
}
for (const dir of ['data', 'components', 'pages', 'lib/i18n']) scan(path.join(root, dir));
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
function align(en, value, lang) {
  if (typeof en === 'string' && typeof value === 'string') { catalogs[lang][en] = value; if (lang === 'uk') pair(en, value); return; }
  if (en && value && typeof en === 'object' && typeof value === 'object') for (const k of Object.keys(en)) align(en[k], value[k], lang);
}
const dictionaries = { en: require('./en.ts').enMessages, uk: require('./uk.ts').ukMessages, ...Object.fromEntries(Object.entries(require('./additional.ts')).map(([k, v]) => [k.slice(0, 2), v])) };
for (const l of langs) align(dictionaries.en, dictionaries[l], l);
for (const file of ['aboutPage', 'cameraPage', 'homePage', 'layoutText', 'partyPage', 'privacyPage', 'weatherUi']) {
  for (const value of Object.values(require('./' + file + '.ts'))) if (value?.en) for (const l of langs) align(value.en, value[l], l);
}
for (const row of JSON.parse(fs.readFileSync(path.join(out, 'authored.json'), 'utf8'))) {
  if (row.length !== 7) throw Error('Invalid authored row ' + row[0]);
  langs.forEach((l, i) => { catalogs[l][row[0]] = row[i]; }); pair(row[0], row[6]);
}
for (const file of fs.readdirSync(out).filter(f => f.startsWith('authored-') && f.endsWith('.json'))) {
  for (const row of JSON.parse(fs.readFileSync(path.join(out, file), 'utf8'))) {
    if (row.length !== 6) throw Error('Invalid authored row ' + row[0]);
    langs.slice(0, 6).forEach((l, i) => { catalogs[l][row[0]] = row[i]; });
  }
}
const sources = { ...JSON.parse(fs.readFileSync(path.join(out, 'source.json'), 'utf8')), ...(fs.existsSync(path.join(out, 'source-extra.json')) ? JSON.parse(fs.readFileSync(path.join(out, 'source-extra.json'), 'utf8')) : {}) };
for (const l of langs) {
  const file = path.join(out, `content.${l}.json`);
  if (!fs.existsSync(file)) continue;
  for (const [id, translation] of Object.entries(JSON.parse(fs.readFileSync(file, 'utf8')))) {
    if (!sources[id]) throw Error(`Unknown source ID ${id} in ${l}`);
    if (typeof translation !== 'string' || !translation.trim()) throw Error(`Empty translation ${l}/${id}`);
    const vars = value => [...value.matchAll(/__VAR_\d+__/g)].map(m => m[0]).sort().join(',');
    if (vars(translation) !== vars(sources[id])) throw Error(`Placeholder mismatch ${l}/${id}`);
    catalogs[l][sources[id]] = translation;
  }
}
const aliasFile = path.join(out, 'uk-source-aliases.json');
if (fs.existsSync(aliasFile)) for (const [uk, en] of Object.entries(JSON.parse(fs.readFileSync(aliasFile, 'utf8')))) pair(en, uk);
for (const [en, ukrainian] of pairs) for (const uk of ukrainian) for (const l of langs) if (catalogs[l][en] !== undefined) catalogs[l][uk] = catalogs[l][en];
for (const l of langs) {
  // Identity entries are intentionally retained: names and technical tokens were reviewed too.
  const result = Object.fromEntries(Object.entries(catalogs[l]).map(([k, v]) => [normalize(k), v]));
  const file = path.join(out, l + '.json');
  if (fs.existsSync(file)) fs.copyFileSync(file, file + '.bak');
  fs.writeFileSync(file, JSON.stringify(result, null, 2) + '\n');
  console.log(l, Object.keys(result).length);
}
