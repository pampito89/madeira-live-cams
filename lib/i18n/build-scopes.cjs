const fs = require('node:fs'), path = require('node:path'), ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const scopes = {};
const normalize = s => s.replace(/\s+/g, ' ').trim();
function add(keys, text) {
  keys.add(normalize(text));
  if (text.includes('\n')) text.split('\n').forEach(line => keys.add(normalize(line)));
}
function dependencies(file, keys, seen) {
  if (seen.has(file) || file.startsWith(path.join(root, 'data') + path.sep)) return;
  seen.add(file);
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function walk(n) {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isJsxText(n)) add(keys, n.text);
    if (ts.isTemplateExpression(n)) add(keys, n.head.text + n.templateSpans.map((span, i) => `__VAR_${i}__` + span.literal.text).join(''));
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier) && n.moduleSpecifier.text.startsWith('.')) {
      const base = path.resolve(path.dirname(file), n.moduleSpecifier.text);
      const next = ['.ts', '.tsx', '/index.ts', '/index.tsx'].map(ext => base + ext).find(p => fs.existsSync(p));
      if (next && !/[\\/]i18n[\\/](?:pageTranslations|TranslationProvider|translation|structuredData)\./.test(next)) dependencies(next, keys, seen);
    }
    ts.forEachChild(n, walk);
  }
  walk(source);
}
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
function dataText(value, keys) {
  if (typeof value === 'string') add(keys, value);
  else if (Array.isArray(value)) value.forEach(item => dataText(item, keys));
  else if (value && typeof value === 'object') Object.values(value).forEach(item => dataText(item, keys));
}
function pages(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'api') pages(file); }
    else if (file.endsWith('.tsx') && !e.name.startsWith('_') && !e.name.startsWith('sitemap')) {
      const route = '/' + path.relative(path.join(root, 'pages'), file).replace(/\\/g, '/').replace(/\.tsx$/, '').replace(/^index$/, '');
      const keys = new Set(); dependencies(file, keys, new Set());
      if (route === '/trip-plan' || route === '/cameras') {
        // These views use location summaries, not the full articles.
        for (const location of require('../../data/plannerLocations.ts').locations) {
          for (const field of ['name', 'area', 'category', 'tags', 'summary', 'imageAlt']) dataText(location[field], keys);
        }
        if (route === '/trip-plan') {
          dataText(require('../../data/restaurants.ts').restaurants, keys);
          dataText(require('../../data/activities.ts').activities, keys);
          dataText(require('../../data/stays.ts').stays, keys);
        }
      }
      scopes[route] = [...keys].filter(Boolean).sort();
    }
  }
}
pages(path.join(root, 'pages'));
fs.writeFileSync(path.join(__dirname, 'catalogs/scopes.json'), JSON.stringify(scopes) + '\n');
console.log('Translation scopes:', Object.keys(scopes).length);
