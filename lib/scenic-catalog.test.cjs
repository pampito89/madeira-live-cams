const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file);
const { locations } = require('../data/locations.ts');
const { scenicLocations } = require('../data/scenicLocations.ts');
const coverage = require('../data/scenic-coverage.json');
const catalogs = require('./i18n/catalogs/scenic.json');
const manifest = require('../data/scenic-photo-manifest.json');
const { resolvePlannerLocation } = require('./calculatePlannerRoute.ts');

test('official directory coverage is complete without duplicate slugs', () => {
    const ids = [...Object.keys(coverage.existing).map(Number), ...coverage.added.map(r => r.sourceIndex)];
    assert.deepEqual(ids.sort((a, b) => a - b), Array.from({ length: 92 }, (_, i) => i));
    assert.equal(scenicLocations.filter(r => r.tags.includes('Viewpoints')).length, 69);
    assert.equal(scenicLocations.filter(r => r.tags.includes('Cable cars')).length, 6);
    assert.equal(locations.filter(r => r.tags.includes('Cable cars')).length, 7);
    assert.equal(new Set(locations.map(r => r.slug)).size, locations.length);
    for (const [index, slug] of Object.entries(coverage.existing))
        assert.ok(locations.some(r => r.slug === slug && r.tags.includes(Number(index) < 85 ? 'Viewpoints' : 'Cable cars')), slug);
    const faja = locations.find(r => r.slug === 'faja-dos-padres');
    assert.equal(faja.image, '/images/explore/faja-dos-padres.jpg');
    assert.ok(faja.tags.includes('Beaches'));
    assert.ok(faja.tags.includes('Lab Travel'));
    assert.ok(!locations.some(r => r.slug === 'faja-dos-padres-cable-car'));
});

test('every new card has sources, an available image and seven-language content', () => {
    for (const r of scenicLocations) {
        assert.ok(r.sources.length > 0, r.slug);
        assert.ok(fs.existsSync(path.join(__dirname, '../public', r.image)));
        assert.equal(r.imagePending, r.image.endsWith('scenic-photo-pending.svg'), r.slug);
        for (const value of [r.summary, r.article.history, r.article.practicalTip, r.category, r.imageAlt]) {
            assert.ok(value.en.trim());
            assert.ok(value.uk.trim());
            for (const locale of ['pt', 'de', 'fr', 'es', 'pl'])
                assert.ok(catalogs[locale][value.en]?.trim(), locale + ': ' + r.slug + ' ' + value.en);
        }
    }
});

test('assigned photos have unique provenance and compressed WebP assets', () => {
    assert.equal(new Set(manifest.photos.map(p => p.slug)).size, manifest.photos.length);
    assert.equal(manifest.photos.length, scenicLocations.filter(r => !r.imagePending).length);
    for (const photo of manifest.photos) {
        const r = scenicLocations.find(r => r.slug === photo.slug);
        assert.equal(r.image, photo.image);
        assert.equal(r.imagePending, false);
        assert.notEqual(r.imageAlt.en, 'Photo coming soon');
        assert.ok(!manifest.unassigned.includes(photo.source));
        const buffer = fs.readFileSync(path.join(__dirname, '../public', photo.image));
        assert.equal(buffer.toString('ascii', 0, 4), 'RIFF');
        assert.equal(buffer.toString('ascii', 8, 12), 'WEBP');
        assert.equal(buffer.length, photo.bytes);
        assert.ok(buffer.length <= 200000, photo.slug);
    }
    for (const slug of ['miradouro-do-castelo-do-pico', 'miradouro-sobre-a-ponta-do-sol'])
        assert.equal(scenicLocations.find(r => r.slug === slug).imagePending, true);
});

test('new planner points resolve locally, including the Funchal waterfront station', async () => {
    for (const r of scenicLocations) {
        const point = await resolvePlannerLocation(r, {}, new Map(), () => { throw Error('Unexpected external geocoding'); });
        assert.ok(point[0] > 32.6 && point[0] < 32.9 && point[1] > -17.3 && point[1] < -16.7, r.slug);
    }
    assert.equal(scenicLocations.find(r => r.slug === 'funchal-cable-car').mapQuery, '32.647073,-16.90225');
    assert.notEqual(scenicLocations.find(r => r.slug === 'miradouro-do-pico-porto-moniz').mapQuery, scenicLocations.find(r => r.slug === 'miradouro-do-pico-sao-jorge').mapQuery);
});

test('all static language editions render translated descriptions, photos and source links', () => {
    for (const locale of ['en', 'uk', 'pt', 'de', 'fr', 'es', 'pl'])
        for (const r of scenicLocations) {
            const html = fs.readFileSync(path.join(__dirname, '../.next/server/pages', locale, 'explore', r.slug + '.html'), 'utf8');
            const json = JSON.parse(html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]);
            const props = json.props.pageProps;
            assert.equal(props.location.mapQuery, r.mapQuery, r.slug);
            assert.equal(props.location.image, r.image, r.slug);
            assert.equal(props.location.imagePending, r.imagePending, r.slug);
            assert.ok(html.includes('rel="canonical"'), r.slug);
            assert.ok(new RegExp('hreflang="' + locale + '"', 'i').test(html), r.slug);
            assert.ok(html.includes('application/ld+json'), r.slug);
            assert.ok(html.includes(r.sources[0].url), r.slug);
            if (!['en', 'uk'].includes(locale))
                assert.equal(props.translationCatalog[r.summary.en], catalogs[locale][r.summary.en], locale + ': ' + r.slug);
        }
});
