# Events editorial workflow

The public feed is `/parties`. It is server-rendered and filters past events using the Atlantic/Madeira date on every request. This is a reviewed editorial feed, not an automatic scraper. External source links are discovery links, not integrated APIs.

Edit `data/events.ts` with a backup first and replace the entire file. Add one record per occurrence with a stable ID, original short summary, inclusive YYYY-MM-DD start/end dates, municipality names from the exported list, category, venue, source URL and the actual verification date. Never infer free admission or ticket availability. Use a direct ticket URL only after verification. For recurring concerts, add each confirmed session separately; do not imply daily performances between first and last dates.

Images are optional: `{ src, alt, credit, permission }`. Use a local image under `/public/images/events/` only with documented permission or a suitable licence. Store the licence/permission reference in `permission`. Do not copy posters or hotlink images merely because a portal displays them. Until permission is obtained, the UI uses decorative category artwork, not an event photograph.

Before publication, confirm date changes/cancellations with the organiser and remove cancelled listings. A source check date is not a guarantee that an event is still running. Check all upcoming records routinely and add new municipal, concert, nightlife, holiday, sport and talk announcements after review. Unknown dates must remain unpublished.

Sources discovered: Events Madeira, Visit Madeira, Câmara de Lobos municipal agenda, AMAK, BOL, Lyven and The Purple Fridays. BOL is nationwide: verify Madeira/Porto Santo venues. The existing `/api/parties/current` integration is retained, but its unverified/undated Instagram fallback is not mixed into the calendar.

Automatic ingestion is a next integration step: obtain an authorised feed/API and image rights per provider; import to a review queue with source IDs, deduplication, cancellation updates, retrieval timestamps and failure monitoring. Do not describe portal links as automatic integrations. No public write endpoint or unprotected admin editor is introduced.
