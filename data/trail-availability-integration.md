# Trail availability integration

Page: /trail-availability (English), /uk/trail-availability (Ukrainian).
Source inspected: 2026-09-26, https://simplifica.madeira.gov.pt/services/78-82-259.

The server reads the public service catalog at /api/infoProcess/259/resources.
It establishes its own anonymous session using the public service page and sends
that session's XSRF header and cookies to the read-only /api/resources/intervals
POST. It never uses a user's login, creates a reservation or submits payment.
This is an observed portal endpoint, not a guaranteed public integration contract.
No credentials need to be configured.

The returned slotTitle contains category-specific availability percentages.
maximumCapacity and reservations do NOT establish remaining seats for a category.
Do not convert them or rounded percentages into a promised seat count.
The inspected public catalog contained 34 bookable resources; missing PR numbers
are not fabricated and do not establish an opening/closure status.

Calendar data is cached in memory for 60 seconds, catalog for one hour.
Concurrent equivalent weekly searches are coalesced. Upstream calls are limited
to three at once per search and eight active searches per server process.
These limits are per process, not a distributed rate limiter.
Failures yield a visible unknown/unavailable state, never invented availability.

Group allocation uses only manually entered seat counts. These stay in React
memory, expire after five minutes, and reset on route/date/category changes or a
new search. Results are proposals, not reservations. Split entries share a date
and stay within the selected maximum start-time gap (30/60/90 minutes).
Automatic exact group-fit search remains unavailable until a verified source of
category-specific remaining counts is provided. The portal link intentionally
has no unsupported route/date/party query parameters; users enter them there.

Validation:
- node --test lib/trail-availability.test.cjs
- node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
- npm run build
- Browser: real seven-day results, EN/UK, route/date reset, manual 8+6 allocation,
  mobile 390px viewport, desktop 1365px, navigation, console errors.
- API: invalid date -> 400; non-GET -> 405; both localized sitemap entries.

Existing repository limitations: npm run lint invokes an unconfigured ESLint
wizard. The existing planner-coordinate-coverage test expects page URLs inside
public/sitemap.xml, which is a sitemap index; this unchanged test fails.
