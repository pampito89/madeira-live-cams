# Nightlife and concert sources

The automatic feed now reads the public Eventbrite music and party listing pages for Funchal, in addition to Events Madeira and AMAK. `lib/events/eventbrite.ts` consumes only published JSON-LD Event metadata; it does not use the discontinued public search API, account credentials, private APIs or browser sessions.

Both lists are merged into `/parties`. Events listed in both use their stable Eventbrite ID for deduplication, including links on different Eventbrite domains. Party listings take precedence for cross-listed club nights. Venue/address fields and coordinates establish that a listing is in Madeira or Porto Santo; a title mentioning Madeira is insufficient. Gaula, Caniço and Camacha map to Santa Cruz. Online and explicitly cancelled/postponed events are excluded. Public listing results are a selection, not a guarantee of exhaustive island coverage.

Cards keep the published date range and venue and link directly to the event/ticket page. No ticket price or availability is inferred. Classification uses the title, venue and description for DJ, techno, electronic music, club and rave terms. Descriptions are not republished. Published language metadata takes priority; otherwise common Portuguese/Spanish title words guide translation, with English as the fallback. Names may remain in their original language.

The same 30-minute request-driven cache, source failure isolation, stale indication, translation quota and poster permission rules apply. Source-level errors or rate limits are not bypassed. Shotgun returned HTTP 429 during discovery and has not been enabled. Madeira.fun and Lyven were inspected but are not enabled import sources.

`node lib/events-nightlife.test.cjs` checks JSON-LD parsing, geography, cancellation, online events, ticket URLs, dates, language hints and deduplication. `--fixtures` additionally reads saved source snapshots under backups. `node lib/events-flow.test.cjs` checks caching and failures for every configured source. Recheck the public markup if a source becomes unavailable.
