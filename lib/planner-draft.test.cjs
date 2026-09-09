const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function mount(saved, requested) {
  const slots = [], effects = [], writes = [], replacements = [];
  let index = 0;
  let draft = { stops: [], departureTime: '09:00', startPoint: 'villa-kent', customStartForRoute: null };
  const router = { isReady: true, query: requested ? { addRestaurant: requested } : {}, pathname: '/trip-plan', replace: ({query}) => { replacements.push(query); router.query = query; return Promise.resolve(true); } };
  const react = {
    useRef(value) { const i = index++; if (!(i in slots)) slots[i] = {current:value}; return slots[i]; },
    useState(value) { const i = index++; if (!(i in slots)) slots[i] = value; return [slots[i], next => {slots[i] = next;}]; },
    useEffect(effect) { effects.push(effect); },
  };
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(require.resolve('./usePlannerDraft.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, {exports, sessionStorage: {getItem:()=>saved, setItem:(_key,value)=>writes.push(JSON.parse(value))}, require: name => name === 'react' ? react : name === 'next/router' ? {useRouter:()=>router} : {getRestaurant: slug => slug === 'restaurant-lilys' ? {slug} : undefined}});
  return {
    render() { index = 0; const ready = exports.usePlannerDraft(draft, value => {draft = {...draft,...value};}); while (effects.length) effects.shift()(); return ready; },
    get draft() { return draft; }, writes, replacements,
  };
}

test('restores a calculated itinerary and adds a restaurant only once after its last stop', () => {
  const saved = JSON.stringify({version:1,draft:{stops:[{id:'first',type:'location',slug:'pico-do-arieiro',arrivalTime:'11:47',durationMinutes:90}],departureTime:'10:12',startPoint:'villa-kent',customStartForRoute:null}});
  const hook = mount(saved, 'restaurant-lilys');
  assert.equal(hook.render(), false);
  assert.equal(hook.writes.length, 0, 'does not overwrite storage with the empty first render');
  assert.equal(hook.render(), true);
  hook.render();
  assert.equal(hook.draft.stops.length, 2);
  assert.equal(hook.draft.stops[0].arrivalTime, '11:47');
  assert.equal(hook.draft.stops[1].arrivalTime, '13:47');
  assert.equal(hook.draft.departureTime, '10:12');
  assert.equal(hook.replacements.length, 1);
  assert.equal(hook.writes.at(-1).draft.stops.length, 2);
});

test('a direct card link starts a route and refresh does not duplicate the restaurant', () => {
  const hook = mount(null, 'restaurant-lilys'); hook.render(); hook.render();
  assert.equal(hook.draft.stops.length, 1);
  assert.equal(hook.draft.stops[0].arrivalTime, '09:30');
  const refreshed = mount(JSON.stringify(hook.writes.at(-1))); refreshed.render(); refreshed.render();
  assert.equal(refreshed.draft.stops.length, 1);
});

test('invalid drafts and unknown restaurant URLs leave the planner usable', () => {
  for (const saved of ['broken-json', JSON.stringify({version:1,draft:{stops:[{id:'bad',type:'location',arrivalTime:'99:00',durationMinutes:20}],departureTime:'99:00',customStartForRoute:{}}})]) {
    const hook = mount(saved, 'not-a-restaurant'); hook.render(); hook.render();
    assert.equal(hook.draft.stops.length, 0);
    assert.equal(hook.draft.departureTime, '09:00');
    assert.equal(hook.draft.customStartForRoute, null);
  }
});
