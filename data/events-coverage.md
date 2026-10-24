# Event import coverage

The feed imports Events Madeira, AMAK, Eventbrite Funchal Parties and Music,
and Eventbrite All events catalogues for Funchal, Madeira island and Porto Santo.
General catalogues are not restricted to music or nightlife. Talks remain hidden
by the presentation layer, as requested. Online, cancelled, postponed and
non-local Eventbrite events are excluded. Past events are filtered using Madeira's date.

Eventbrite pagination is read from public search metadata. All advertised pages
are fetched (up to a safety budget of ten pages per catalogue). A failed page or
exceeded budget fails that source refresh, preserving its previous snapshot and
marking it stale; it does not publish a partial refresh. Schema-only listings
without pagination metadata are treated as a single page. Event IDs and title/date
pairs deduplicate overlapping catalogues. Ticket links support both slug and
numeric Eventbrite URL forms.

Refresh is request-driven, with a 30-minute source cache and five-minute retry
cooldown after errors. This is not a background scheduler. Eventbrite public
search results do not guarantee every platform event, including private or
unlisted events. Municipality agendas, Shotgun and other discovery portals are
not connected by this change. AMAK retains its existing four-page limit.

Validate with node --test lib/events*.test.cjs. Optional local captured-page
checks: node lib/events-coverage.test.cjs --fixtures (requires ignored backups).
