# Trail availability integration

Pages: /trail-availability (EN), /uk/trail-availability (UK).
Source: https://simplifica.madeira.gov.pt/services/78-82-259.
Calendar inspected 2026-09-26; booking router inspected 2026-09-27.

The server reads /api/infoProcess/259/resources. It establishes an anonymous
session and sends its XSRF header and cookies to the read-only
/api/resources/intervals POST. The application never creates reservations or
submits payments. This observed portal endpoint is not a guaranteed API contract.

slotTitle provides category percentages. maximumCapacity, reservations and
rounded percentages do not establish exact remaining category seat counts.
Missing routes do not establish closure; empty source responses remain unknown.

## Calendar and selection

Default 30-day inclusive period; selectable 1–30 days within the next 90 days.
There are 7/14/30-day shortcuts and an arrival-in-two-weeks shortcut.
Sequential weekly requests render progressively; the last can read six extra
days, which are discarded client-side. Failed and pending dates are distinct.
Route/range changes abort client fetch and invalidate older responses.
Cache: calendar 60 seconds, catalog one hour. Equivalent weeks are coalesced.
Maximum three upstream requests per search, eight searches per server process.
Already-running upstream work may finish after client cancellation.

Tiles count available future time slots for the selected category, with Ukrainian
plural labels (1 тайм-слот, 2 тайм-слоти, 10 тайм-слотів). Slot cards and calculator
inputs include only positive category availability. Zero and unknown slots are
hidden. Unknown/error days do not become sold-out claims. Past entry times are
excluded using Atlantic/Madeira. The recommendations box has been removed.

A chosen single slot prepares a copyable route/date/time/group/category summary.
Changing route, date, category or group prevents reuse of the old selection.
Source data over five minutes old blocks new slot selections and group fits.

## Explicit group calculation

TrailGroupCalculator has its own form and Calculate button. Results distinguish
missing counts, invalid group size, expired source data, no fit, and valid plans.
8+6 checked seats can fit 14 when splitting and the allowed start gap permit it.
Counts stay in component memory, expire after five minutes, and reset on calendar
date/category/route changes and new searches. Editing any input invalidates the
previous result until Calculate is pressed again. The result receives keyboard
focus and is announced with aria-live. Valid plans can be copied; expired plans
are not copied. No exact counts are inferred from percentages.

## Booking handoff

The public SIMplifica bundle index-944fd728.js imports chunk-bb130d8a.js for
CustomServicesPage. This module recognizes /services/:id/start and invokes
startProcess from chunk-f55d85a9.js. The handler POSTs startProcesses with only
processId, themeId, serviceId. It then navigates to a session-specific process
URL (potentially including accessHash), or to authentication if required.
There is no route/date/time/party prefill in this observed handler.

The Start on SIMplifica link uses the supported /services/78-82-259/start route.
It is a user-initiated external application start, not an automatically fetched
or prefetched URL. Copyable details and a fallback service-page link are shown.
No accessHash/session URLs are stored or shared. The route was verified by
reading the public router, not by creating a live application. Automatic safety
review rejected a test click on Solicitar because it may create an external
workflow; no alternate execution of that action was attempted.

## Validation

- node --test lib/trail-availability.test.cjs lib/trail-planning.test.cjs lib/trail-booking.test.cjs
- node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
- npm run build
- Browser: positive-only slots, explicit calculation, missing-count feedback,
  8+6 split, changed-input invalidation, selection/copy, EN/UK, desktop/mobile.

Existing limitations: npm run lint invokes an unconfigured ESLint wizard.
An unrelated planner-coordinate-coverage test expects page URLs in
public/sitemap.xml, which is a sitemap index; that existing test fails.
