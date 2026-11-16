# Viewpoints and cable cars — verification

Completed: 2026-11-16. Source research: 2026-11-15.

## Coverage

- Compared 85 entries in the Visit Madeira viewpoint directory with the existing catalogue.
- Reused 17 existing location URLs; added 68 viewpoint cards and 7 passenger cable-car cards.
- The coverage manifest records each official source and its existing or new slug. It does not claim to include every informal lookout or viewpoints on Porto Santo.
- Corrected Eira da Achada's municipality, coordinates and historical description. Added the viewpoint filter tag to the existing Pico Ruivo and Santana houses cards.
- Distinct Pico viewpoints in Porto Moniz and São Jorge have distinct coordinates.
- Funchal cable-car routing uses the waterfront station at Almirante Reis. Ninho da Manta driving directions stop at the Pico do Areeiro approach, with walking/access instructions.

## Content and photographs

- Seven language editions: EN, PT, DE, FR, ES, PL, UK. English summaries were authored from the sources; Ukrainian copy was manually edited. Other language translations were generated offline and sampled for review, with corrections to practical instructions. No translation service is called by visitors.
- Historical notes use documented facts. Where the source does not record a founding date, the card says so. These are short source-backed histories/context notes, not exhaustive historical monographs.
- The source date does not imply live confirmation of access, operating hours or safety.
- New photographs remain pending owner submission; the shared camera-icon SVG is explicitly a placeholder. See scenic-photos-needed.md.

## Checks

- Initial and final npm run build: passed; final build generated 1,528 static pages.
- TypeScript: passed via next build and explicit tsc --noEmit --incremental false.
- scenic-catalog.test.cjs: 4 passing tests, covering all 525 generated editions, translation presence, canonical/hreflang/structured metadata, source links, unique slugs and local coordinates.
- planner-route.test.cjs and planner-draft.test.cjs: 13 passing tests, including adding every catalogue entry from its card.
- Runtime sitemap-pages.xml: HTTP 200; all 525 new language URLs present.
- Browser: desktop and 390px mobile card inspection; no horizontal document overflow; route destination inspected; Funchal cable car added to the planner; both catalogue and planner filters exposed all 7 cable cars.
- git diff --check: passed.

## Existing limitations

- npm run lint invokes the ESLint setup wizard: no working lint configuration is present. Dependencies/configuration were not changed for this content task.
- The older planner-coordinate-coverage.test.cjs fails on villa-kent and its assumption that the static public/sitemap.xml contains activity URLs. Those unrelated assertions were not changed. New location coverage and the actual dynamic sitemap were checked separately.
- Next.js reports large trip-plan page-data payloads (approximately 152–182 kB, compared with 139–166 kB before this change).
- Route calculation requires the existing Google Routes service; its usage endpoint was unavailable during browser inspection. Card-to-plan navigation and route logic tests passed, but a paid live route calculation was not performed.

## Backup and delivery

- Original files saved under backups/scenic-2026-11-15; source backups use .bak extensions so TypeScript does not compile them.
- Changed files were written as complete replacements. Unrelated pre-existing changes were excluded from the commit.
- Local implementation only; no production deployment was performed.
