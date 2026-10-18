# Airport flight board

The camera page includes a localized FNC board. Live data requires an AeroDataBox subscription through RapidAPI with access to the airport FIDS endpoint (Tier 2). Check FNC/LPMA coverage, commercial display rights, caching terms and the request allowance before subscribing. No account or subscription is created by this change.

Put the secret in the project's ignored `.env.local`:

```dotenv
AERODATABOX_RAPIDAPI_KEY=
```

Never use a NEXT_PUBLIC prefix or commit the key. Restart the local server after setting it. Configure the same server-only secret in the hosting environment before deploying.

The server requests FNC only, for the previous 2 and next 10 hours, including cancellations. It coalesces concurrent requests and caches responses for 5 minutes per server process. CDN caching lasts 60 seconds. Multiple server instances can each contact the provider, so configure provider spending limits. No requests happen if the key is absent.

The browser polls every 5 minutes while visible. The board shows the retrieval timestamp, dates and times in Atlantic/Madeira, and provider attribution. Upstream failures clear displayed data rather than present an old schedule as current. Unknown statuses stay unknown; scheduled flights are not labelled on time without evidence. Airport and airline proper names are retained as supplied.

Verification after credentials are configured:

1. GET `/api/airport-flights` returns 200, arrivals, departures and fetchedAt. Confirm representative FNC flights against the airport/airline.
2. Open `/uk/cameras/madeira-airport`, switch direction and search for a returned flight number. Verify localized status and Madeira time, including dates around midnight.
3. Verify the source's live coverage (not just scheduled coverage). Empty lists must not be interpreted as cancelled flights.
4. Without credentials or on provider failure, the endpoint returns 503 with a generic error and the UI shows a translated unavailable message. No sample flights are shipped or used as fallback.

Contract: https://doc.aerodatabox.com/rapidapi.html
Relative FIDS: https://aerodatabox.com/realtive-fids/
