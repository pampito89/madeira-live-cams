# Location access status

The catalogue shows one compact word below weather, independently of weather availability. Restaurants, villas and supermarkets are excluded. All seven site languages are supported.

## Coverage and meaning

`locationTrailIds` in `locationStatus.ts` explicitly maps 15 catalogue entries to the official IFCN Madeira route table. The badge describes that named PR route, not road access, adjacent viewpoints, a summit outside the route, or current weather safety. Other locations show Unknown. Do not infer Open from an absent warning or from another nearby route.

Source: https://ifcn.madeira.gov.pt/pt/atividades-de-natureza/percursos-pedestres-recomendados/percursos-pedestres-recomendados.html

This is the source's published route status, not a live sensor or a guarantee of access. New blanket emergency notices can precede a table update. Users must observe local barriers and authority instructions. The tooltip and accessible label include the exact source qualification, retrieval time in Madeira time, and source URL. A source retrieval timestamp is not the authority's publication timestamp.

## Refresh and failure behaviour

The page renders without waiting for status data. A single request serves all cards; existing fresh session data is reused on return. Active pages poll every 60 seconds and refresh on visibility/online changes. Requests stop on unmount and hidden pages do not poll. The API deduplicates in-flight requests, caches successful results in-process for 60 seconds and uses 60-second shared HTTP caching with a further 60-second background-revalidation window. Cold instances can fetch independently.

A five-minute absolute freshness limit is checked by the client. Expiry is checked every ten seconds and immediately on returning to the page. Network failures produce Unknown rather than silently refreshing an old timestamp. An upstream request has a five-second timeout. No credentials, paid service or new dependency is used.

## Maintaining the adapter

The parser selects the Madeira table by the Areeiro route name; Porto Santo reuses the same route numbers and must never overwrite Madeira entries. It reads the status column only, so a closure mentioned elsewhere in the route description is not mistaken for the route state. Unknown table formats and missing/duplicate route IDs fail conservatively. Qualified openings, partial access and controlled one-way circulation are Restricted, not unconditionally Open. Works are Maintenance only when explicitly reported in the status cell.

To add another source, verify exact location identity, status semantics, source URL and freshness first. Extend the source allowlist in `freshStatus` together with the provider and tests. Do not scrape Google Maps pages or introduce a paid Places integration without an agreed billing setup.

Validation: `node --test lib/location-status.test.cjs`, `npm run build`, desktop/mobile catalogue checks. The repository's lint script requires initial ESLint setup and is not currently configured.
