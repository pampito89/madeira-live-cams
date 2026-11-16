# Scenic catalogue verification — 2026-11-16

## Current coverage

- 85 Visit Madeira viewpoint-directory entries and seven cable-car entries are mapped to existing or new cards in scenic-coverage.json.
- Achadas da Cruz and Rocha do Navio each have one card with both Viewpoints and Cable cars tags. Their separate viewpoint cards were removed; descriptions and source links were retained on the cable-car cards.
- Fajã dos Padres uses its original card and photograph.
- Added Miradouro de Ponta Delgada (ER102, two dragon trees) from Madeira Island Map with explicit coordinates and seven-language content. No unverified founding date or tree age is asserted.
- 73 new cards remain, representing 511 language editions. Six are cable-car cards; the seventh cable car is the existing Fajã dos Padres card.
- Photo requests list each new place once. No third-party photographs copied.

## Duplicate audit

Compared location names and all coordinate pairs within 350 m across the catalogue. Two same-site viewpoint/cable-car pairs were merged. Decisions for the remaining nearby pairs are recorded in scenic-duplicate-audit.json. Neighbouring attractions were retained when they represent distinct places, such as a garden and public square, beach and elevated lookout, or statue and boarding station. Ninho da Manta shares the Pico do Arieiro driving trailhead but is a separate walking destination.

This is an audit of current catalogue data, not a guarantee that every possible alias or erroneous coordinate in older content has been identified. The regional directory is not an exhaustive inventory of informal lookouts.

## Checks

- Previous build passed before this change; final npm run build passed with 1,514 generated pages.
- Explicit tsc --noEmit --incremental false passed.
- All 17 selected catalogue/planner tests passed, including static multilingual metadata/content and local coordinate resolution.
- Browser: Ponta Delgada rendered on desktop and 390px mobile; cable-car filter showed seven cards, including Rocha do Navio — Santana and one Achadas da Cruz.
- git diff --check passed.

## Existing limitations

- Standalone lint is not configured; npm run lint opens the setup wizard.
- Existing coordinate coverage tests have unrelated villa-kent and obsolete static-sitemap assumptions; they were not modified.
- Next.js warns that trip-plan data exceeds 128 kB (approximately 152–181 kB).
- No paid live route calculation performed. Sources do not certify live operating/access conditions.
- Earlier non-English catalogue translations were generated offline and sampled; new Ponta Delgada copy was translated directly in all supported languages.

## Delivery

Full-file replacement backups: backups/scenic-dedup-2026-11-16. Prior backups remain in backups/scenic-2026-11-15 and backups/faja-deduplicate-2026-11-16.

Local changes only; no production deployment. Unrelated dirty files excluded from the commit.