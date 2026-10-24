const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (mod,file) => mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,file);
const {parseEventbrite,loadEventbritePages,eventbritePagination}=require('./events/eventbrite.ts');
const stamp='2026-10-24T12:00:00Z';
const event=(id,name)=>({'@type':'Event',name,startDate:'2026-11-01',url:`https://www.eventbrite.com/e/${id}`,location:{name:'Venue',address:{addressCountry:'PT',addressLocality:'Funchal',addressRegion:'Madeira'}}});
const page=(items,pages=2)=>`<script type="application/ld+json">${JSON.stringify({'@type':'ItemList',itemListElement:items})}</script><script>${JSON.stringify({events:{pagination:{page_count:pages,object_count:items.length}},current_page:'search'})}</script>`;
(async()=>{
 const names=[['Wine tasting','Food'],['Concerto','Music'],['Christmas festival','Festivals'],['Art exhibition','Culture'],['Techno party','Nightlife'],['Conference','Talks']];
 for(const [name,category] of names) assert.equal(parseEventbrite(page([event(123,name)]),stamp,'all')[0].category,category);
 assert.deepEqual(parseEventbrite('<script>{"current_page":"search","events":{"pagination":{"page_count":0,"object_count":0}}}</script>',stamp,'all'),[]);
 assert.throws(()=>parseEventbrite('<html>Access denied</html>',stamp,'all'));
 const urls=[];
 const all=await loadEventbritePages('https://www.eventbrite.com/d/portugal--funchal/all-events/',stamp,'all','eventbrite-funchal',async url=>{urls.push(url);return page([event(123,'Wine tasting'),event(456,'Art exhibition')]);},page([event(123,'Wine tasting')]));
 assert.equal(all.length,2);assert.equal(all[1].sourceId,'eventbrite-funchal');
 assert.deepEqual(urls,['https://www.eventbrite.com/d/portugal--funchal/all-events/?page=2']);
 await assert.rejects(loadEventbritePages('https://www.eventbrite.com/',stamp,'all','eventbrite-madeira',async()=>{throw new Error('Offline');},page([event(123,'First')])));
 await assert.rejects(loadEventbritePages('https://www.eventbrite.com/',stamp,'all','eventbrite-madeira',async()=>'',page([],11)));
 assert.equal(eventbritePagination(page([],2)).pages,2);
 const porto=event(789,'Concert');porto.location.address.addressLocality='Porto Santo';
 assert.deepEqual(parseEventbrite(page([porto]),stamp,'all')[0].municipalities,['Porto Santo']);
 if(process.argv.includes('--fixtures')){
  const first=fs.readFileSync('backups/events-expand-0.html','utf8');
  const second=fs.readFileSync('backups/events-more-2.html','utf8');
  const actual=await loadEventbritePages('https://www.eventbrite.com/d/portugal--funchal/all-events/',stamp,'all','eventbrite-funchal',async()=>second,first);
  assert.ok(actual.length>parseEventbrite(first,stamp,'all').length);
  console.log('Real Funchal catalogue:',actual.length);
 }
 console.log('PASS: categories, numeric ticket URLs, empty catalogue, pagination, deduplication, failed-page rejection and Porto Santo.');
})().catch(error=>{console.error(error);process.exitCode=1;});
