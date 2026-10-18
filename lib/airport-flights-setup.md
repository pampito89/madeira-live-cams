# FNC flight snapshots — Aviationstack Free

The camera page makes no flight API request on mount. One button POSTs to `/api/airport-flights`, which returns both arrivals and departures. All provider pages are fetched before publishing a snapshot; no ten-row limit or search is applied. Only identical records are deduplicated. Codeshare numbers remain visible, so record counts are not unique aircraft counts.

Server secret in ignored `.env.local`: `AVIATIONSTACK_API_KEY`. Never expose it with NEXT_PUBLIC or log provider request URLs. AeroDataBox is no longer used by this endpoint.

## Quota and cache

A completed snapshot is reused for 48 hours. There is no browser polling or automatic provider refresh. After 48 hours the next button press can refresh. Each page costs a request. The provider currently returns 100 rows per page, so the number of calls depends on the listing size.

The application permits at most 80 provider request attempts in a rolling 32-day window. This conservatively leaves room within the 100-request free plan for the two earlier key checks and other manual use. Calls made outside this application are not tracked; do not share the same key with other applications without accounting for their usage.

Quota is persisted BEFORE every external call, including failed calls. Failed loads retain the last complete snapshot, clearly labelled with its original retrieval time, and use a six-hour retry cooldown. A changed pagination total, empty intermediate page, timeout or exhausted budget cannot publish a partial board.

Local persistent state lives in ignored `backups/airport-flight-cache/`. Do not delete this directory to reset quota. It contains no API keys. Local file locking prevents concurrent processes from spending twice. A stale lock expires after 120 seconds; a fetch batch has a 45-second deadline.

When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are configured, a shared Redis state and distributed lock are used instead. On Vercel without Redis the route fails closed: a per-instance filesystem cannot safely enforce the quota. Before deployment, transfer existing request usage to shared storage or wait for the quota window; do not reset usage by switching stores. Keep the same storage across deployments and key rotations must reflect actual provider account quotas.

No provider subscription or payment is created by this integration. Check the provider dashboard for actual quota and plan settings. Free-plan suitability depends on continued noncommercial use.

## Display

Desktop: two boards side by side. Mobile: two vertically stacked boards with independently scrollable cards and jump links. Dates and times use Atlantic/Madeira. A notice identifies this as a saved list, not a live operational board. Snapshots older than one hour gain an additional age warning. Airport/airline names remain as supplied; interface and statuses support seven languages.

Run `node lib/verify-airport-flights.cjs`. Verify production UI has no automatic flight request before the button, then confirm a second press reuses the persisted snapshot without another provider call.

Sources: https://aviationstack.com/pricing and https://aviationstack.com/faq
