# Civil Protection news

Routes: `/uk/news` and `/uk/news/{official numeric article ID}`. Other locale routes redirect to Ukrainian. News is an item in the shared left menu; history controls contain only Back and Forward.

The only news source is the official SRPC, IP-RAM RSS feed at https://procivmadeira.pt/pt/10-noticias.html?format=feed&type=rss. The feed supplies article text. Upstream markup is rendered as escaped text; remote media and scripts are not executed.

The current five announcements have Ukrainian translations in `civil-protection-uk.json`. They are used only when the source title and paragraphs exactly match the bundled official snapshot, so a corrected notice cannot silently retain an outdated translation. New or changed announcements use the existing cached MyMemory translation adapter with its shared daily budget. If complete translation is unavailable, the original is retained and explicitly labelled. This never invents a translated safety instruction. Machine-translated content is labelled separately.

Refresh is request-driven, with a ten-minute cache and up to two minutes of HTTP cache. It is not a background scheduler. Feed errors retain the last successful data and timestamp and retry after a minute. The timestamp remains in the snapshot; the visible automatic-check information block was removed at the user's request.

UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN enable persistent shared archive storage. Without them, local runs use `backups/civil-protection-news.json`; serverless runs use temporary storage and cannot guarantee an archive across instance restarts. No secrets are stored here.

The Ukrainian interface and content have matching language metadata, canonical URLs and sitemap entries. Article bodies explicitly identify their actual language when translation is unavailable.

Checks: `node lib/civil-protection-news.test.cjs`, `node lib/civil-protection-uk.test.cjs`, `npm run build`. The existing lint command prompts for ESLint setup; no lint configuration was changed.
