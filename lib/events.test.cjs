const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
function load(relative) {
 const filename = path.join(__dirname, relative);
 const module = new Module(filename, module);
 return module;
}
function compile(relative) {
 const filename = path.join(__dirname, relative);
 const instance = new Module(filename);
 instance.filename = filename;
 instance.paths = module.paths;
 instance._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
 return instance.exports;
}
const { filterEvents, madeiraDate, monthDays, shiftMonth } = compile('events.ts');
const { events, municipalities } = compile('../data/events.ts');
assert.equal(municipalities.length, 11);
assert.equal(new Set(events.map(e => e.id)).size, events.length);
for (const event of events) {
 assert.ok(event.start <= event.end);
 assert.ok(event.municipalities.every(m => municipalities.includes(m)));
 assert.equal(new URL(event.sourceUrl).protocol, 'https:');
 if (event.image) assert.ok(event.image.permission && event.image.credit && event.image.alt);
}
assert.equal(filterEvents(events, { today: '2026-10-24', date: '2026-10-24' }).some(e => e.id === 'legend-2026'), true);
assert.equal(filterEvents(events, { today: '2026-10-25' }).some(e => e.id === 'legend-2026'), false);
assert.equal(filterEvents(events, { today: '2026-10-23', date: '2026-11-01', municipality: 'Câmara de Lobos' })[0].id, 'chestnut-2026');
assert.equal(filterEvents(events, { today: '2026-10-23', category: 'Nightlife' }).length, 0);
assert.equal(filterEvents(events, { today: '2026-10-23', query: '  CHESTNUT ' }).length, 1);
assert.equal(filterEvents(events, { today: '2028-01-01' }).length, 0);
assert.equal(madeiraDate(new Date('2026-07-01T23:30:00Z')), '2026-07-02');
assert.equal(monthDays('2028-02').filter(Boolean).length, 29);
assert.equal(monthDays('2026-11')[6], '2026-11-01');
assert.equal(shiftMonth('2026-12', 1), '2027-01');
assert.equal(shiftMonth('2027-01', -1), '2026-12');
console.log('PASS: event dates, Madeira timezone, filters, empty states, leap year, month navigation, source records.');
