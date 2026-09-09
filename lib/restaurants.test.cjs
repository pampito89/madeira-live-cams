const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadTs(relative) {
  const filename = path.resolve(__dirname, relative);
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { exports, require: name => name.startsWith('.') ? loadTs(path.relative(__dirname, path.resolve(path.dirname(filename), name + '.ts'))) : require(name) });
  return exports;
}
const { mealTypeForTime, restaurantStopTitle } = loadTs('./restaurantMeals.ts');
const { restaurants, restaurantLocations, restaurantCoordinates } = loadTs('../data/restaurants.ts');
const publicLocations = loadTs('../data/locations.ts').locations;

test('meal labels follow arrival, including the exact noon and 17:00 boundaries', () => {
  for (const [time, expected] of [['00:00', 'breakfast'], ['11:00', 'breakfast'], ['11:59', 'breakfast'], ['12:00', 'lunch'], ['16:59', 'lunch'], ['17:00', 'dinner'], ['23:59', 'dinner']]) assert.equal(mealTypeForTime(time), expected);
  assert.equal(restaurantStopTitle('Lily’s', '11:00', 'uk'), 'Сніданок в Lily’s');
  assert.equal(restaurantStopTitle('Lily’s', '12:00', 'uk'), 'Обід в Lily’s');
  assert.equal(restaurantStopTitle('Lily’s', '17:00', 'en'), 'Dinner at Lily’s');
  for (const value of ['', '24:00', '17:60', 'noon']) assert.equal(mealTypeForTime(value), null);
});

test('all 30 submitted venues have unique cards and valid Madeira coordinates', () => {
  assert.equal(restaurants.length, 30);
  assert.equal(new Set(restaurants.map(r => r.slug)).size, 30);
  assert.equal(new Set(restaurants.map(r => r.googleMapsUrl)).size, 30);
  for (const r of restaurants) {
    assert.ok(r.latitude > 32 && r.latitude < 33 && r.longitude > -18 && r.longitude < -16);
    assert.ok(r.rating > 0 && r.rating <= 5 && Number.isInteger(r.reviewCount) && r.reviewCount > 0);
    assert.ok(r.summary.en && r.summary.uk && r.praised.en && r.praised.uk);
    assert.ok(restaurantCoordinates[r.slug]);
    assert.ok(!publicLocations.some(location => location.slug === r.slug));
  }
});

test('restaurants are discoverable in the planner, but not the public locations collection', () => {
  assert.ok(restaurantLocations.every(r => r.hiddenFromExplore && r.tags.includes('Restaurants')));
  assert.equal(loadTs('../data/plannerLocations.ts').locations.filter(r => r.tags.includes('Restaurants')).length, 30);
  assert.equal(restaurants.filter(r => r.temporarilyClosed).length, 1);
  assert.equal(restaurants.find(r => r.temporarilyClosed).slug, 'restaurant-frente-ao-sol-o-polvo');
});

test('supplied restaurant photos stay within 100 kB', () => {
  for (const restaurant of restaurants) {
    const file = path.resolve(__dirname, '../public', '.' + restaurant.image);
    if (fs.existsSync(file)) assert.ok(fs.statSync(file).size <= 100000, `${restaurant.image} exceeds 100 kB`);
  }
});
