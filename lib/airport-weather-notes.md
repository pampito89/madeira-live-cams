# FNC weather panel

The airport camera sidebar uses observed METAR weather for LPMA from NOAA Aviation Weather Center. It does not report airport operational status, closures, NOTAMs or flight acceptance. The airport notices link goes to the official airport homepage; no notice scraping is enabled.

Source API: https://aviationweather.gov/data/api/
Fixed request: https://aviationweather.gov/api/data/metar?ids=LPMA&format=json

The server uses a descriptive User-Agent, a 10-second timeout, a 5-minute per-process cache, request coalescing and a 60-second failure cooldown. The endpoint accepts GET only. The browser polls while visible and reassesses observation age every 30 seconds. No paid key is needed. API failure clears the display; old or incomplete observations are grey, never silently green.

Observation time is displayed in Atlantic/Madeira. Wind/gusts convert knots to km/h using 1.852. API visibility is in statute miles; METAR 9999/CAVOK is rendered as at least 10 km. Missing gusts mean not reported, not zero. The original observation is available in the disclosure.

The colour is an explicitly disclosed site heuristic, not an official aviation colour scale or operating limit:

- Yellow: wind >=20 kt, gusts >=30 kt, visibility <5 km, MVFR, or reported precipitation.
- Red: wind >=30 kt, gusts >=40 kt, visibility <1 km, IFR/LIFR, TS, FC, SQ or FZ phenomena.
- Grey: observation older than 90 minutes, more than 10 minutes in the future, or missing wind, visibility or flight category. Missing source data is also grey.
- Green: none of these triggers in the available report. This does not establish that an airport or flight is operating.

NOAA flight category covers ceiling and visibility, not overall airport operability: https://aviationweather.gov/gfa/help/

Run `node lib/verify-airport-weather.cjs` for normalization, age, colour, locale and API resilience tests. Fixtures are used only in tests; production has no sample weather fallback.
