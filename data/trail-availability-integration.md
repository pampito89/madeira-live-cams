# Trail availability integration

Pages: /trail-availability (EN), /uk/trail-availability (UK).
Source: https://simplifica.madeira.gov.pt/services/78-82-259, inspected 2026-09-26.

The server reads /api/infoProcess/259/resources. It establishes its own anonymous
session and sends its XSRF header and cookies to the read-only
/api/resources/intervals POST. No user login, reservation or payment is submitted.
This is an observed portal endpoint, not a guaranteed public API contract.

slotTitle supplies category-specific percentages. maximumCapacity, reservations
and rounded percentages do not establish exact remaining category seat counts.
Missing routes do not establish closure; empty days are unknown, not sold out.

## Month planning

The default inclusive period is 30 days. Users can choose 1–30 days within the
next 90 days, select 7/14/30-day shortcuts, or move arrival two weeks ahead.
Changing arrival preserves the selected period length. Departure can be adjusted.
The calendar is a rolling date grid; each tile includes its weekday and month.

The browser loads sequential weekly batches through the existing API. The final
batch can read up to six extra days; only requested dates enter the UI. Results
appear progressively. Failed days stay distinct from pending and zero-percent
days; successful batches survive failures elsewhere. A new search refreshes all
selected dates. Route/date changes abort the client request and invalidate old
responses. Already running upstream work may finish and populate server cache.

Calendar cache: 60 seconds; catalog: one hour. Equivalent weekly requests are
coalesced. Maximum three upstream requests per search, eight active searches per
server process. These are per-process limits, not a distributed rate limiter.

Recommendations are the earliest fresh dates with at least one future slot over
0% for the selected category. They do not assert that a group fits. Results older
than five minutes are labelled stale and excluded from recommendations/allocation.
Today’s past entry times are excluded using Atlantic/Madeira local time.

Exact allocation uses only manually checked counts in React memory. They expire
after five minutes and clear on new searches, route/date-range/category changes.
Selecting a calendar day preserves entries so plans can be compared across dates.
All subgroups must enter on the same date within the selected 30/60/90-minute gap.
Group size is 1–100. Proposals do not reserve places. No exact automatic group-fit
search is claimed. The official portal link has no unsupported query parameters.

## Validation

- node --test lib/trail-availability.test.cjs lib/trail-planning.test.cjs
- node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
- npm run build
- Browser: month request, arrival shortcut, EN/UK, desktop/mobile, split calculator.

Existing limitations: npm run lint invokes an unconfigured ESLint wizard.
The existing planner-coordinate-coverage test expects page URLs inside
public/sitemap.xml, which is a sitemap index; that unrelated test fails.
