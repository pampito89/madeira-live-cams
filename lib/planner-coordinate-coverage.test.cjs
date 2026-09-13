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
test('every catalogue location has local coordinates, including outdoor activities', () => {
  const source = ts.createSourceFile('planner.tsx', fs.readFileSync(path.resolve(__dirname, '../pages/trip-plan.tsx'), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declaration = source.statements.filter(ts.isVariableStatement).flatMap(s => [...s.declarationList.declarations]).find(d => d.name.getText(source) === 'locationCoordinates');
  const { restaurantCoordinates } = load(path.resolve(__dirname, '../data/restaurants.ts'));
  const { activityCoordinates } = load(path.resolve(__dirname, '../data/activities.ts'));
  const code = ts.transpileModule('const points = ' + declaration.initializer.getText(source) + '; exports.points = points;', { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, restaurantCoordinates, activityCoordinates });
  const { locations } = load(path.resolve(__dirname, '../data/plannerLocations.ts'));
  for (const location of locations) {
    const point = exports.points[location.slug];
    assert.ok(point, location.slug);
    assert.ok(point.length === 2 && point.every(Number.isFinite), location.slug);
    assert.ok(Math.abs(point[0]) <= 90 && Math.abs(point[1]) <= 180, location.slug);
  }
});
test('all three activities are public, uniquely addressable and route to the verified map points', async () => {
  const { activities } = load(path.resolve(__dirname,'../data/activities.ts'));
  const { locations } = load(path.resolve(__dirname,'../data/locations.ts'));
  const { resolvePlannerLocation } = load(path.resolve(__dirname,'calculatePlannerRoute.ts'));
  assert.equal(activities.length,3);
  for(const activity of activities) {
    const matches=locations.filter(l=>l.slug===activity.slug);
    assert.equal(matches.length,1);
    assert.equal(matches[0].hiddenFromExplore,false);
    assert.ok(matches[0].tags.includes('Outdoor activities'));
    assert.ok(!matches[0].tags.includes('Restaurants'));
    const point=await resolvePlannerLocation(matches[0],{},new Map(),()=>{throw Error('Should not need geocoding');});
    assert.equal(point[0],activity.latitude); assert.equal(point[1],activity.longitude);
    const sitemap=fs.readFileSync(path.resolve(__dirname,'../public/sitemap.xml'),'utf8');
    for(const locale of ['en','uk']) assert.ok(sitemap.includes('/'+locale+'/explore/'+activity.slug));
  }
});
