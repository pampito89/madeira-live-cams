# News category illustrations and trail policy source

Generated with the built-in image_gen tool on 2026-11-10; no text, logos or watermarks. Decorative category illustrations, not photographs of reported incidents. Existing news-roads-madeira image is now reserved for the collection header. Cards and detail headers select a category image automatically, as in the Events page. Archived list entries stay compact; their detail pages have the relevant category header.

Files: public/images/news-{roads,trails,weather,general}-v2-{480,960}.jpg. JPEG quality 75, 480×320 and 960×640; responsive srcset; cards lazy-load. Originals remain under the Codex generated_images directory.

Exact shared prompt:
Use case: photorealistic-natural. Create one landscape 3:2 editorial-style illustrative background for a Madeira news category card: {subject}. Cohesive natural photographic style, muted forest green and teal palette, subject predominantly right, calm dark left space for HTML text overlay. No text, letters, numbers, logos, watermarks, no collage. Illustrative generic scene, not documentary incident evidence.

Subjects:
- roads: a curving asphalt mountain road in Madeira with modest orange maintenance cones on the right shoulder, basalt cliff and distant Atlantic, no people
- trails: a narrow Madeira levada hiking path beside mossy stone water channel in lush laurel forest, fern detail, mountains beyond
- weather: dramatic rainy Atlantic coast of Madeira with storm clouds and waves against volcanic cliffs, no destruction or people
- general: generic mountain rescue equipment, orange backpack and safety helmet placed on stone at a Madeira mountain lookout, distant green mountain ridges, no insignia

## Additional source
RTP Madeira Sociedade: https://madeira.rtp.pt/sociedade/
This is a public broadcaster, not an official closure authority. Source attribution stays visible. Import only titles about trails/levadas/veredas together with prices, fees, reservations, tickets, access or rules. Existing official closure sources are unchanged. Import the title and short lead (max 400 characters), not the full media article or photos. Discovery and source rechecks run on page requests, cached ten minutes, with allowlisted HTTPS URLs, timeouts, stale fallback and ledger revisions. Current archive rules still apply (ordinary news moves to archive after 30 days); this is a news feed, not a permanent tariff reference.

Verified article: https://madeira.rtp.pt/sociedade/taxas-nos-percursos-pedestres-aumentam-a-partir-de-1-de-abril-de-2027/
Published 10 November 2026. Announced effective date 1 April 2027, not an already effective increase. Concise Ukrainian summary is bound to the exact source title/lead fingerprint and falls back to translation if changed. Numeric details cross-checked against Lusa reporting: https://www.noticiasaominuto.com/pais/3081791/madeira-aumenta-taxas-de-percursos-pedestres-veja-os-novos-valores

Checks: node lib/trail-policy-news.test.cjs; node lib/news-works-regression.test.cjs; npm run build; browser desktop/mobile. ESLint configuration is absent in this checkout.
