# Viewpoints and cable cars — verification

Updated 2026-11-16; source research 2026-11-15.

## Coverage and content

- Covered 85 Visit Madeira viewpoint directory entries: 17 existing cards and 68 new cards.
- Covered seven passenger cable cars: six new cards and the existing Fajã dos Padres card with the Cable cars tag.
- Fajã dos Padres keeps its original URL, photo, description, history, beach and Lab Travel tags. The duplicate card and its auxiliary coordinates/duration were removed before deployment.
- 74 new cards have seven language editions (EN, PT, DE, FR, ES, PL, UK), source links and explicit photo placeholders. Photos await owner submission; see scenic-photos-needed.md. No new photo is required for Fajã dos Padres.
- Short historical notes use source-backed facts and disclose missing founding dates. Directory coverage does not imply all informal viewpoints or Porto Santo coverage, or live confirmation of access and safety.
- Eira da Achada municipality/coordinates/history corrected; Pico Ruivo and Santana houses tagged as viewpoints. Distinct Pico viewpoints retain distinct coordinates. Funchal cable-car routing uses the waterfront station.

## Validation

- Before and after builds passed. Latest npm run build generated 1,521 static pages.
- Explicit tsc --noEmit --incremental false passed.
- Catalog regression checks cover 518 new static language editions, metadata, translations, source links, local coordinates, and seven cable cars with no duplicate Fajã dos Padres card.
- Browser follow-up confirmed original Fajã dos Padres photo and text and exactly seven results in the cable-car filter. Desktop/mobile layout and add-to-plan behavior were verified during the initial implementation.
- Original runtime sitemap verification passed; directory generation uses the current location data.

## Existing limitations

- npm run lint opens the ESLint setup wizard; no configured standalone lint check exists.
- Older planner-coordinate-coverage.test.cjs has unrelated failures for villa-kent and an obsolete static sitemap assumption.
- Next.js warns about trip-plan page data of approximately 152–181 kB.
- Live paid route calculation was not performed; its usage endpoint was unavailable during initial inspection.
- Other-language translations were generated offline and sampled, with corrections; no runtime translation service is used.

## Backups and delivery

- Initial backups: backups/scenic-2026-11-15.
- Deduplication backups: backups/faja-deduplicate-2026-11-16.
- Files written as complete replacements. Unrelated work excluded from commits.
- Local implementation only; no production deployment performed.