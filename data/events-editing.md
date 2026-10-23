# Automatic events feed

`/parties` and `/api/events?locale=en` use the same server importer. The page renders events on the server for SEO and polls the API every minute while visible. The server checks each source at most once per 30 minutes per warm instance/cache. Refresh is demand-driven: a visit/API request after cache expiry triggers the import; no background cron is installed. A source failure retries after five minutes, keeps its last successful snapshot for at most seven days, and labels that source stale. Expired events are removed using Atlantic/Madeira dates. A successful import replaces that source’s snapshot, so removed announcements do not persist indefinitely.

## Import templates

- `lib/events/adapters.ts`: Events Madeira card template (`gt-event-style-3`) and AMAK/The Events Calendar REST template. Events Madeira supplies English titles; AMAK supplies Portuguese. Only factual title/date/category/location/source fields are imported. Source HTML, biographies, contacts and long descriptions are never rendered or sent for translation. Cancellation/postponement labels are excluded when present. Listings can be incomplete or internally inconsistent: visitors are directed to the organiser for final information.
- `lib/events/feed.ts`: fixed source endpoints, eight-second timeouts, two-megabyte limits, per-source caching/failure isolation and deduplication. No request parameter can supply a source URL. AMAK pagination is capped at four 50-record pages to bound requests.
- To add another source, inspect its published feed/API and terms, add a parser with fixtures and validation, then add a fixed endpoint in SOURCES. Do not silently treat ticket-directory links as integrations.

The original `data/events.ts` editorial records and `/api/parties/current` remain available in the repository but are not mixed into the automatic feed. This prevents superseded editorial dates and undated Instagram fallback records from appearing current.

## Translation

Seven UI languages: EN, PT, DE, FR, ES, PL, UK. Short factual descriptions are generated from translated category/location templates. Source titles are translated automatically through the documented MyMemory GET API; successful results are cached for up to 90 days (Redis) or retained locally. Cache keys include original text and both languages, so changed titles are retranslated. Native English source titles do not consume translation quota. Translated titles are marked and their originals can be expanded. Source titles are retained, with an explicit pending label, when translation is unavailable.

Anonymous MyMemory has a 5,000-character daily allowance. This integration reserves at most 4,800 characters/day, translates only titles, uses six workers and a six-second work window, and resumes remaining translations on subsequent requests. Provider failures retry after one hour. More than one application sharing the same public IP can exhaust the provider limit before this application does. No private data is submitted and no translation-memory contributions are made.

Local development uses `backups/events-cache-v2/`. For Vercel production, configure **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN** through deployment secrets to share snapshots, translations and an atomic daily translation budget across instances. Without shared Redis, event imports still work with best-effort /tmp caching, but paid/limited translation requests are disabled on Vercel because /tmp cannot enforce a shared quota. Do not reuse map-service keys for translation. No keys or paid translation accounts are created by this change.

References: https://mymemory.translated.net/doc/spec.php and https://mymemory.translated.net/doc/usagelimits.php. For consistent high-volume translation across every language, provision a provider/quota suited to that volume; the current free tier may leave some titles in their source language until the next daily budget.

## Posters

`data/event-posters.ts` maps stable imported IDs to approved poster metadata: src, alt, credit, permission. The card uses `object-fit: contain`, a stable frame, lazy loading, visible attribution and a decorative fallback on image error. Only add artwork with documented reuse rights; the mere presence of a poster on a source page is not permission. Sources currently have no approved poster licence recorded, so their decorative category cards are intentional. The image itself is not machine-translated or edited: dates and translated text are rendered alongside it.

## Checks

`node lib/events-import.test.cjs` validates fixtures, entity decoding, unsafe URL rejection, invalid dates, cancellation, deduplication, stale expiry and seven-language labels. Add `--fixtures` locally to test against the downloaded source snapshots in backups (not committed). `node lib/events.test.cjs` covers filtering/date boundaries. Run TypeScript and the project build after changes. ESLint currently opens a setup wizard and is not configured.
