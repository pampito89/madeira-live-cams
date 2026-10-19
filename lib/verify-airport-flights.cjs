const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const { remainingToday, flightSearchKey } = require('./todayFlights.ts');
const { normalizeStackFlights, readStackPage } = require('./aviationstack.ts');
const now = Date.parse('2026-10-18T12:00:00Z');
const flight = (number, scheduled, status = 'Expected', revised = null) => ({ number, scheduled, status, revised, airline: 'Test', airport: 'Lisbon', airportCode: 'LIS' });
const list = [flight('YESTERDAY','2026-10-17T18:00:00Z','EnRoute'), flight('LANDED','2026-10-18T14:00:00Z','Arrived'), flight('DEPARTED','2026-10-18T14:00:00Z','Departed'), flight('FUTURE','2026-10-18T14:00:00Z'), flight('ACTIVE','2026-10-18T11:00:00Z','EnRoute'), flight('PAST','2026-10-18T11:00:00Z'), flight('TOMORROW','2026-10-19T14:00:00Z'), flight('DELAY','2026-10-18T10:00:00Z','Delayed','2026-10-18T15:00:00Z')];
assert.deepEqual(remainingToday(list, now).map(f=>f.number), ['ACTIVE','FUTURE','DELAY']);
assert.equal(remainingToday([flight('MIDNIGHT','2026-10-18T23:30:00Z')],Date.parse('2026-10-18T23:00:00Z')).length,1);
assert.equal(remainingToday([flight('OLD','2026-10-18T22:30:00Z','EnRoute')],Date.parse('2026-10-18T23:00:00Z')).length,0);
assert.equal(flightSearchKey(' tp 123 '), flightSearchKey('TP123'));
assert.throws(()=>readStackPage({data:[],pagination:{offset:0,count:0,total:3}},0));
const fixture = (direction, index) => ({ flight: {iata:'TP'+index}, airline:{name:'Test'}, flight_status:'active', departure:{iata:direction==='departures'?'FNC':'LIS',scheduled:new Date().toISOString()},arrival:{iata:direction==='arrivals'?'FNC':'LIS',scheduled:new Date().toISOString()} });
assert.equal(normalizeStackFlights([fixture('departures',1)],'departures')[0].status,'Departed');
async function call(handler, method='POST', origin) {
  const res={setHeader(){},status(code){this.code=code;return this;},json(body){this.body=body;return this;}};
  await handler({method,headers:{host:'localhost:3100',origin}},res);return res;
}
(async()=>{
 const originalFetch=global.fetch, originalKey=process.env.AVIATIONSTACK_API_KEY;
 try {
  const handler=require('../pages/api/airport-flights.ts').default;
  delete process.env.AVIATIONSTACK_API_KEY;
  assert.equal((await call(handler)).code,503);
  assert.equal((await call(handler,'GET')).code,405);
  assert.equal((await call(handler,'POST','https://other.example')).code,403);
  process.env.AVIATIONSTACK_API_KEY='test-only';
  let requests=0;
  global.fetch=async raw=>{requests++;const url=new URL(raw);const direction=url.searchParams.has('arr_iata')?'arrivals':'departures';const offset=Number(url.searchParams.get('offset'));return {ok:true,json:async()=>({data:[fixture(direction,offset)],pagination:{offset,count:1,total:2}})};};
  const responses=await Promise.all([call(handler),call(handler)]);
  assert.equal(requests,4);assert.equal(responses[0].body.arrivals.length,2);assert.equal(responses[0].body.departures.length,0);
  await call(handler);assert.equal(requests,8,'Every new click fetches fresh data');
  assert.ok(!JSON.stringify(responses[0].body).includes('test-only'));
  global.fetch=async()=>({ok:false});assert.equal((await call(handler)).code,503,'No stale fallback');
  console.log('PASS: Madeira date boundaries, remaining flights, completed-flight exclusion, delayed flights, flight search, pagination, fresh refresh, no stale fallback, concurrent request deduplication, origin guard and key protection.');
 } finally {global.fetch=originalFetch;if(originalKey===undefined)delete process.env.AVIATIONSTACK_API_KEY;else process.env.AVIATIONSTACK_API_KEY=originalKey;}
})().catch(error=>{console.error(error);process.exitCode=1;});
