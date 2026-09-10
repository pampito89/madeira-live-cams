const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');

function load(file, overrides = {}, cache = new Map()) {
  if (cache.has(file)) return cache.get(file);
  const exports = {}; cache.set(file,exports);
  const source = ts.transpileModule(fs.readFileSync(file,'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, {exports, Date, ...overrides.globals, require: name => overrides[name] ?? load(path.resolve(path.dirname(file),name+'.ts'),overrides,cache)});
  return exports;
}

function mount(saved, query = {}) {
  const slots = [], effects = [], writes = [], replacements = [];
  let index = 0;
  let draft = { stops: [], departureTime: '09:00', startPoint: 'villa-kent', customStartForRoute: null };
  const router = { isReady: true, query, pathname: '/trip-plan', replace: ({query}) => { replacements.push(query); router.query = query; return Promise.resolve(true); } };
  const react = {
    useRef(value) { const i = index++; if (!(i in slots)) slots[i] = {current:value}; return slots[i]; },
    useState(value) { const i = index++; if (!(i in slots)) slots[i] = value; return [slots[i], next => {slots[i] = next;}]; },
    useEffect(effect) { effects.push(effect); },
  };
  const hook = load(path.join(__dirname,'usePlannerDraft.ts'), {'react':react,'next/router':{useRouter:()=>router},globals:{sessionStorage:{getItem:()=>saved,setItem:(_key,value)=>writes.push(JSON.parse(value))}}});
  return {
    render() { index = 0; const ready = hook.usePlannerDraft(draft,value=>{draft={...draft,...value};}); while(effects.length) effects.shift()(); return ready; },
    get draft() { return draft; }, writes, replacements,
  };
}

test('adding from a card preserves calculated stops and day settings, and consumes the query once',()=>{
  const saved=JSON.stringify({version:1,draft:{stops:[{id:'first',type:'location',slug:'pico-do-arieiro',arrivalTime:'11:47',durationMinutes:90}],departureTime:'10:12',startPoint:'villa-kent',customStartForRoute:null}});
  const hook=mount(saved,{addLocation:'continente-modelo-machico',keep:'yes'});
  assert.equal(hook.render(),false); assert.equal(hook.writes.length,0);
  hook.render(); hook.render();
  assert.equal(hook.draft.stops.length,2);
  assert.equal(hook.draft.stops[0].arrivalTime,'11:47');
  assert.equal(hook.draft.stops[1].arrivalTime,'13:47');
  assert.equal(hook.draft.stops[1].durationMinutes,45);
  assert.equal(hook.draft.departureTime,'10:12');
  assert.equal(hook.replacements.length,1);
  assert.equal(hook.replacements[0].keep,'yes');
  assert.equal(hook.replacements[0].addLocation,undefined);
  const refresh=mount(JSON.stringify(hook.writes.at(-1))); refresh.render(); refresh.render();
  assert.equal(refresh.draft.stops.length,2);
});

test('every catalogue point can be added from its card with the planner default duration',()=>{
  const {locations}=load(path.join(__dirname,'../data/plannerLocations.ts'));
  const {plannerStopDuration}=load(path.join(__dirname,'plannerStopDuration.ts'));
  for(const location of locations) {
    const hook=mount(null,{addLocation:location.slug}); hook.render(); hook.render();
    assert.equal(hook.draft.stops.length,1,location.slug);
    assert.equal(hook.draft.stops[0].slug,location.slug);
    assert.equal(hook.draft.stops[0].durationMinutes,plannerStopDuration(location));
    assert.equal(hook.draft.stops[0].arrivalTime,'09:30');
  }
  assert.equal(plannerStopDuration({slug:'airport',tags:['Airport']}),15);
  assert.equal(plannerStopDuration({slug:'levada-nova-levada-do-moinho',tags:[]}),150);
});

test('existing restaurant links remain compatible and cannot double-add with two parameters',()=>{
  for(const query of [{addRestaurant:'restaurant-lilys'},{addRestaurant:'restaurant-lilys',addLocation:'restaurant-lilys'}]) {
    const hook=mount(null,query); hook.render(); hook.render();
    assert.equal(hook.draft.stops.length,1);
    assert.equal(hook.draft.stops[0].durationMinutes,90);
    assert.equal(Object.keys(hook.replacements[0]).length,0);
  }
});

test('unknown locations, arrays and broken storage cannot inject stops',()=>{
  for(const query of [{addLocation:'https://example.com'},{addLocation:['restaurant-lilys']},{addLocation:'missing'}]) {
    const hook=mount('broken-json',query); hook.render(); hook.render();
    assert.equal(hook.draft.stops.length,0);
    assert.equal(hook.draft.departureTime,'09:00');
  }
});
