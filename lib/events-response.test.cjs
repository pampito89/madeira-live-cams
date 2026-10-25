const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
require.extensions['.ts'] = (mod,file) => mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,file);
const originalLoad = Module._load;
let feed = {events:[],sources:[{status:'fresh'}]};
Module._load = function(request,parent,isMain) {
 if(request === '../../lib/events/feed') return {getEventFeed:async()=>feed};
 return originalLoad.call(this,request,parent,isMain);
};
const handler = require('../pages/api/events.ts').default;
Module._load = originalLoad;
async function response(method='GET',locale='uk') {
 const result={headers:{},code:200};
 const res={setHeader(key,value){result.headers[key]=value;return res;},status(code){result.code=code;return res;},json(body){result.body=body;return res;}};
 await handler({method,query:{locale}},res);
 return result;
}
(async()=>{
 const valid = await response();
 assert.equal(valid.code,200);
 assert.match(valid.headers['Cache-Control'],/stale-while-revalidate=300/);
 assert.deepEqual(valid.body,feed);
 feed={events:[],sources:[{status:'unavailable'}]};
 const failed=await response();
 assert.equal(failed.code,503);
 assert.equal(failed.headers['Cache-Control'],'no-store');
 feed={events:[],sources:[{status:'stale'}]};
 assert.equal((await response()).code,200,'A usable stale snapshot remains available');
 assert.equal((await response('POST')).code,405);
 assert.equal((await response('GET','invalid')).code,400);
 console.log('PASS: cached public feed, stale fallback, uncached total outage, method and locale boundaries.');
})().catch(error=>{console.error(error);process.exitCode=1;});
