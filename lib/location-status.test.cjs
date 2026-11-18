const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const { classifyTrailState, parseIfcnStatuses, freshStatus, locationTrailIds, IFCN_STATUS_URL, STATUS_MAX_AGE } = require('./locationStatus.ts');
const row = (id, name, state) => `<tr><td colspan="2">Info</td><td>${id}</td><td>${name}</td><td>1 km</td><td>From – To</td><td>${state}</td><td>IFCN</td></tr>`;
const table = '<table><tr><th>ESTADO</th></tr>' + row('1', 'Vereda do Areeiro', 'ENCERRADO/CLOSED') + row('1.2', 'Vereda do Pico Ruivo', 'ABERTO/OPEN') + ['5','6','6.1','6.2','8','9','10','11','12','13','14','17','18'].map(id=>row(id,'Route','ABERTO/OPEN')).join('') + '</table>';
test('closures, restricted access and works cannot become a green open badge', () => {
 assert.equal(classifyTrailState('ENCERRADO/CLOSED'), 'closed');
 assert.equal(classifyTrailState('PARCIALMENTE ABERTO'), 'restricted');
 assert.equal(classifyTrailState('ABERTO/OPEN (circulação controlada num único sentido)'), 'restricted');
 assert.equal(classifyTrailState('ENCERRADO (Transitável até ao km 3,5)'), 'restricted');
 assert.equal(classifyTrailState('ENCERRADO PARA OBRAS'), 'maintenance');
 assert.equal(classifyTrailState('ABERTO/OPEN'), 'open');
 assert.equal(classifyTrailState('ABERTO com condição desconhecida'), 'unknown');
 assert.equal(classifyTrailState(''), 'unknown');
});
test('Porto Santo route numbers never overwrite Madeira; similar place names are not inferred', () => {
 const feed = parseIfcnStatuses(table + '<table>' + row('1', 'Vereda do Pico Branco', 'ABERTO/OPEN') + '</table>');
 assert.equal(feed.statuses['pico-do-arieiro'].state, 'closed');
 assert.equal(feed.statuses['pico-ruivo'].state, 'open');
 assert.equal(feed.statuses['levada-nova-levada-do-moinho'], undefined);
 assert.equal(feed.statuses['fanal-forest'], undefined);
 assert.equal(feed.statuses['miradouro-do-ninho-da-manta'], undefined);
 const { locations } = require('../data/locations.ts');
 for (const slug of Object.keys(locationTrailIds)) assert.ok(locations.some(location=>location.slug===slug),slug);
});
test('broken source layouts fail instead of inventing availability', () => {
 assert.throws(()=>parseIfcnStatuses('<html>Maintenance</html>'));
 assert.throws(()=>parseIfcnStatuses('<table>ESTADO Vereda do Areeiro'+row('1','Route','OPEN')+'</table>'));
 assert.throws(()=>parseIfcnStatuses(table.replace('</table>', row('1','Duplicate','OPEN')+'</table>')));
});
test('expired, future and invalid cached statuses are rejected', () => {
 const now = Date.now();
 const status = {state:'open',checkedAt:new Date(now).toISOString(),source:IFCN_STATUS_URL,detail:'PR8'};
 assert.ok(freshStatus(status, now));
 assert.equal(freshStatus(status, now+STATUS_MAX_AGE),undefined);
 assert.equal(freshStatus(status, now-1),undefined);
 assert.equal(freshStatus({...status, checkedAt:'invalid'},now),undefined);
 assert.equal(freshStatus({...status, source:'https://example.com'},now),undefined);
});
test('API coalesces concurrent calls, caches successful results and does not accept writes', async () => {
 const originalFetch=global.fetch;
 let calls=0;
 global.fetch=async()=>{calls++;return new Response(table,{status:200});};
 try {
  const handler=require('../pages/api/location-status.ts').default;
  const response=()=>({headers:{},code:0,body:null,setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(v){this.body=v;return this;},end(){return this;}});
  const a=response(), b=response();
  await Promise.all([handler({method:'GET'},a),handler({method:'GET'},b)]);
  assert.equal(calls,1);assert.equal(a.code,200);assert.equal(b.body.statuses['pico-do-arieiro'].state,'closed');
  const c=response();await handler({method:'GET'},c);assert.equal(calls,1);
  const d=response();await handler({method:'POST'},d);assert.equal(d.code,405);assert.equal(calls,1);
  const realNow=Date.now;Date.now=()=>realNow()+120000;
  global.fetch=async()=>{throw Error('offline');};
  try {const e=response();await handler({method:'GET'},e);assert.equal(e.code,503);assert.deepEqual(e.body.statuses,{});assert.equal(e.headers['Cache-Control'],'no-store');} finally {Date.now=realNow;}
 } finally {global.fetch=originalFetch;}
});
