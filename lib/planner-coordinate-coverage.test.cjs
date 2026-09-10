const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
function load(file) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, require: name => load(path.resolve(path.dirname(file), name + '.ts')),
  });
  return exports;
}
test('every current catalogue location has local coordinates, including São Cristóvão and the airport', () => {
  const source = ts.createSourceFile('planner.tsx', fs.readFileSync(path.resolve(__dirname, '../pages/trip-plan.tsx'), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declaration = source.statements.filter(ts.isVariableStatement).flatMap(s => [...s.declarationList.declarations]).find(d => d.name.getText(source) === 'locationCoordinates');
  const { restaurantCoordinates } = load(path.resolve(__dirname, '../data/restaurants.ts'));
  const code = ts.transpileModule('const points = ' + declaration.initializer.getText(source) + '; exports.points = points;', { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, restaurantCoordinates });
  const { locations } = load(path.resolve(__dirname, '../data/plannerLocations.ts'));
  for (const location of locations) {
    const point = exports.points[location.slug];
    assert.ok(point, location.slug);
    assert.ok(point.length === 2 && point.every(Number.isFinite), location.slug);
    assert.ok(Math.abs(point[0]) <= 90 && Math.abs(point[1]) <= 180, location.slug);
  }
});
