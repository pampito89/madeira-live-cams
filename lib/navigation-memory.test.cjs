const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync(require.resolve('./useNavigationMemory.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
function harness(blocked = false) {
    const store = new Map();
    let state, effects;
    const react = {
        useState(initial) { state = initial; return [state, next => { state = typeof next === 'function' ? next(state) : next; }]; },
        useRef(value) { return { current: value }; },
        useEffect(effect) { effects.push(effect); },
    };
    const exports = {};
    vm.runInNewContext(source, { exports, require: name => name === 'react' ? react : {}, sessionStorage: {
        getItem(key) { if (blocked) throw new Error('blocked'); return store.get(key); },
        setItem(key, value) { if (blocked) throw new Error('blocked'); store.set(key, value); },
    } });
    return { store, mount(name, initial) { effects = []; const result = exports.useNavigationState(name, initial); effects.forEach(effect => effect()); return { set: result[1], get: () => state }; } };
}
test('filter survives unmount and repeated returns without being consumed', () => {
    const h = harness(); h.mount('cameras:activeFilter', 'All').set('Beaches');
    assert.equal(h.mount('cameras:activeFilter', 'All').get(), 'Beaches');
    assert.equal(h.mount('cameras:activeFilter', 'All').get(), 'Beaches');
});
test('page filters stay independent and reset persists', () => {
    const h = harness(); h.mount('cameras:activeFilter', 'All').set('Beaches');
    assert.equal(h.mount('index:activeFilter', 'All').get(), 'All');
    h.mount('cameras:activeFilter', 'All').set('All');
    assert.equal(h.mount('cameras:activeFilter', 'All').get(), 'All');
});
test('event date range survives return and malformed shapes are ignored', () => {
    const h = harness(); const initial = { from: '', to: '' }; const range = { from: '2026-11-17', to: '2026-11-20' };
    h.mount('parties:dateRange', initial).set(range);
    assert.equal(JSON.stringify(h.mount('parties:dateRange', initial).get()), JSON.stringify(range));
    h.store.set('madeira-navigation-v1:filter:parties:dateRange', '{"from":42,"to":null}');
    assert.equal(h.mount('parties:dateRange', initial).get(), initial);
});
test('blocked storage retains navigation state in memory', () => {
    const h = harness(true); h.mount('filter', '').set('Music');
    assert.equal(h.mount('filter', '').get(), 'Music');
});
test('corrupt storage cannot prevent the page rendering', () => {
    const h = harness(); h.store.set('madeira-navigation-v1:filter:filter', 'broken JSON');
    assert.equal(h.mount('filter', 'All').get(), 'All');
});
