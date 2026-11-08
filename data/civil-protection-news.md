# Civil Protection news

Routes: `/news` and `/news/{official numeric article ID}`. The global newspaper icon opens the news section. Headlines open internal article pages.

The only ingestion source is the official SRPC, IP-RAM RSS feed at https://procivmadeira.pt/pt/10-noticias.html?format=feed&type=rss. The feed supplies article text. Original Portuguese text is displayed as escaped React text; remote scripts, images and HTML are never executed. Source attribution links to each official announcement. No automatic translation or claims that a historical notice is currently active are added.

Refresh is request-driven, with a ten-minute cache, plus up to two minutes of HTTP cache. It is not a background scheduler: when nobody visits, no request is made. Feed errors retain the last successful data and timestamp, show a saved-data notice and retry after a minute. The bundled official RSS snapshot is the initial fallback.

Existing UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN settings enable persistent shared archive storage. Without them, local runs use `backups/civil-protection-news.json`; serverless runs use temporary storage and cannot guarantee an archive across instance restarts. Configure shared Redis for a durable production archive. No secrets are stored here.

Only the English interface URL is indexed until other language editions are authored. Article bodies have `lang="pt"`. Other locale routes redirect to the English interface. The sitemap includes all stored article URLs.

Checks: `node lib/civil-protection-news.test.cjs`, `npm run build`. The existing lint command prompts for ESLint setup; no lint configuration was changed as part of this feature.
