# Airport flights

Set AVIATIONSTACK_API_KEY in .env.local (server only). The board loads on button press and each refresh requests new pages from Aviationstack over HTTPS. No application quota cap, saved snapshot, retry cooldown, or Redis prerequisite is applied. Simultaneous requests within the same process share the pending fetch only.

All available pages are read before publishing a result. Records are filtered to the current Madeira calendar day using the revised time when available. Arrived and departed flights are excluded. A valid past actual or actual_runway movement timestamp takes precedence over a lagging status. Past scheduled flights are excluded unless explicitly in flight, approaching, delayed, boarding, or gate closed. Tomorrow and yesterday are not shown. Failures show an unavailable state, never an old saved board.

Remaining nonterminal statuses are shown as unconfirmed when their latest expected time is at least 30 minutes overdue, or when the loaded board is at least five minutes old. These are display freshness thresholds, not evidence that a flight landed. Unconfirmed records sort below current records. Returning to a background tab updates freshness immediately. The board shows a short refresh reminder; only the explicit refresh button requests new provider data. Status accuracy still depends on the provider.

The flight-number search filters loaded lists locally and makes no provider requests. Interface labels cover all seven site locales. Data retrieval time is displayed. The provider's own subscription limits still apply; the app does not buy or upgrade a plan.

Run node lib/verify-airport-flights.cjs and node lib/verify-flight-freshness.cjs for offline tests, then npm run build. Verify the airport page on mobile and desktop. Old flightSnapshotStore.ts and local snapshots are unused by this integration, retained without deleting user data.
