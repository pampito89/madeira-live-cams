const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// Deterministic hook lifecycle: control both debounce timers and network completion.
function mount() {
  const state = [], timers = new Set(), requests = [];
  let index = 0, dependencies, cleanup;
  const exports = {};
  const react = {
    useState(initial) {
      const slot = index++;
      if (!(slot in state)) state[slot] = initial;
      return [state[slot], value => { state[slot] = typeof value === 'function' ? value(state[slot]) : value; }];
    },
    useEffect(effect, next) {
      if (!dependencies || next.some((value, i) => value !== dependencies[i])) {
        cleanup?.(); dependencies = next; cleanup = effect();
      }
    },
  };
  const source = fs.readFileSync(require.resolve('../components/CustomDayPoint.tsx'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(compiled, {
    exports, require: name => name === 'react' ? react : {}, AbortController,
    setTimeout: callback => { timers.add(callback); return callback; },
    clearTimeout: callback => timers.delete(callback),
    fetch: (url, options) => new Promise(resolve => requests.push({ url, options, resolve })),
  });
  return {
    render(input, active = true) { index = 0; return exports.useCustomDayPoint(input, active); },
    fire() { const pending = [...timers]; timers.clear(); return Promise.all(pending.map(callback => callback())); },
    requests,
  };
}
const point = (name, latitude = 32.7, longitude = -16.8) => ({ name, latitude, longitude });

test('short mobile links use the existing resolver and expose its exact coordinates', async () => {
  const hook = mount(), link = 'https://maps.app.goo.gl/Jyw2PFhTFpx9rLjG8?g_st=ic';
  assert.equal(hook.render(link).loading, true);
  const pending = hook.fire();
  const request = hook.requests[0];
  assert.equal(request.url, '/api/resolve-route-point');
  assert.equal(request.options.method, 'POST');
  assert.deepEqual(JSON.parse(request.options.body), { url: link });
  request.resolve(Response.json(point('Alforno Madeira', 32.729779, -16.7716615)));
  await pending;
  assert.equal(hook.render(link).point.name, 'Alforno Madeira');
  assert.deepEqual(Array.from(hook.render(link).coordinates), [32.729779, -16.7716615]);
});

test('editing invalidates coordinates immediately and ignores a late response', async () => {
  const hook = mount();
  hook.render('old'); const old = hook.fire();
  hook.render('new'); const next = hook.fire();
  assert.equal(hook.requests[0].options.signal.aborted, true);
  hook.requests[1].resolve(Response.json(point('New'))); await next;
  hook.requests[0].resolve(Response.json(point('Old'))); await old;
  assert.equal(hook.render('new').point.name, 'New');
  assert.equal(hook.render('changed').coordinates, null);
  assert.equal(hook.render('').loading, false);
  assert.equal(hook.render('').coordinates, null);
});

test('inactive end points make no requests and cancel work when start equals finish', async () => {
  const hook = mount();
  hook.render('link', false); await hook.fire();
  assert.equal(hook.requests.length, 0);
  hook.render('link'); const pending = hook.fire();
  assert.equal(hook.render('link', false).coordinates, null);
  assert.equal(hook.requests[0].options.signal.aborted, true);
  hook.requests[0].resolve(Response.json(point('Ignored'))); await pending;
  assert.equal(hook.render('link', false).point, null);
});

test('errors can be retried and the two endpoints resolve independently', async () => {
  const start = mount(), end = mount();
  start.render('start'); end.render('end');
  const first = start.fire(), second = end.fire();
  start.requests[0].resolve(Response.json({ error: 'Unavailable' }, { status: 503 }));
  end.requests[0].resolve(Response.json(point('Finish')));
  await Promise.all([first, second]);
  assert.equal(start.render('start').error, 'Unavailable');
  assert.equal(end.render('end').point.name, 'Finish');
  start.render('start').retry();
  assert.equal(start.render('start').loading, true);
  const retry = start.fire();
  start.requests[1].resolve(Response.json(point('Start'))); await retry;
  assert.equal(start.render('start').point.name, 'Start');
});
