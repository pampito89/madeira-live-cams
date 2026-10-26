# Event card localization

Current catalogue audited on 2026-10-26: 91 event titles, seven languages
(en, pt, de, fr, es, pl, uk), and 39 venue/name components.

`event-title-translations.json` contains complete title translations keyed by the
original imported title. `event-venue-translations.json` contains venue labels;
artist, brand, address and establishment names may intentionally remain unchanged.
Municipality filter values and original source titles are never translated in
place. Ukrainian venue labels use Ukrainian place names; official Portuguese
place names remain usable in the underlying filters and source links.

The checked-in catalogue takes precedence over source-language metadata, transient
translation caches, and network translation. This corrects existing Portuguese and
Russian titles incorrectly marked English. Catalogue entries do not consume API
quota and survive serverless cold starts. The API reports translation `catalog`
for these titles, including intentionally preserved proper names.

New or changed titles fall back to the existing bounded automatic translation
service; that fallback still depends on provider quota and production cache setup.
This catalogue does not guarantee translations for future unreviewed events.
When adding a title, supply every supported locale. Keep names, times, edition
numbers and factual meaning intact. Do not translate an entire unknown event by
matching a few words of another event's title.

Validation: `node lib/events-localization.test.cjs`.
Optional captured live-feed audit: append `--audit` (requires the ignored audit
snapshot in backups). Build-generated feed JSON and production feeds should also
be checked for new titles absent from the catalogue before release.
