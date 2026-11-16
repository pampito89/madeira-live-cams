# Scenic catalogue verification — 2026-11-16

## Current catalogue

74 new cards, including Levada do Norte, with 518 language editions (EN, UK, PT, DE, FR, ES, PL). The official viewpoint/cable directory coverage remains unchanged: 85 viewpoint entries and seven cable cars map to existing or added cards.

Achadas da Cruz and Rocha do Navio each use a single card with both tags. Fajã dos Padres retains its original card and photo. Prior duplicate decisions are recorded in scenic-duplicate-audit.json. Ponta Delgada and Levada do Norte are additional researched locations outside the original directory manifest.

## Levada do Norte

- User map link resolves to Levada do Norte at 32.6920062, -17.0388825. The same coordinates are used in the card, planner and weather lookup.
- Searched the existing location data before adding; no existing Levada do Norte card found.
- Original description and historical account translated into all seven supported languages. Historical sources: Junta de Freguesia do Estreito de Câmara de Lobos and RTP.
- Construction began in 1947; inauguration on 1 June 1952. Distances and hiking duration are not inferred from a point on the channel. The 90-minute planner default is explicitly an editable allowance.
- Tags: Levada walks and Hiking. Shared photo placeholder retained pending owner photo. Requested filename: levada-do-norte.webp.
- Sources and review date are displayed. No claim of currently open/safe access.

## Validation

- Previous build passed before the change. Final npm run build passed: 1,521 static pages.
- Explicit tsc --noEmit --incremental false passed.
- Catalogue and planner-draft regression tests verify multilingual static pages, metadata, coordinates and adding catalogue locations to the plan.
- Browser verified Levada do Norte in Ukrainian on desktop and at 390px mobile width.
- git diff --check passed. All modified files fully rewritten after backup under backups/levada-do-norte-2026-11-16.

## Existing limitations

Standalone lint is not configured (npm run lint opens setup). Next.js reports large trip-plan data payloads (152–181 kB). Older coordinate tests have unrelated villa-kent/static-sitemap assumptions. No live paid route calculation performed.

Earlier catalogue translations were generated offline and sampled; Levada do Norte translations were authored directly. Sources are not live operational status checks. No external photographs copied or generated.

Local implementation only; no production deployment. Unrelated work is excluded from the commit.