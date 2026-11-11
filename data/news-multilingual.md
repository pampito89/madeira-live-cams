# Multilingual news

News collection, article and archive links support en, pt, de, fr, es, pl and uk. UI labels are authored in lib/i18n/newsText.ts. Dates use the selected locale and Madeira time. Canonical URLs/hreflang and sitemap use all seven editions; English is x-default. The car-rental language scope is unchanged.

Public news translations are stored in data/news-translations.json, keyed by SHA256(source language + exact source text), and loaded only by server-side news code. The initial catalog covers 26 source/revision records in seven languages. Reviewed Ukrainian summaries remain the canonical concise text where their source fingerprints match; other notices use the Portuguese source. Source names, periods, locations and archive reasons are localized too. Translation is marked as automatic when appropriate.

New/changed public text uses the translation endpoint already used by the site's catalog workflow, with bounded concurrency, request timeouts, deduplication, persistent cache where available and a short failure cooldown. Exact-text keys prevent an old translation being reused after a correction. A failed complete translation falls back to explicitly marked Portuguese text; it never claims an unavailable translation succeeded. No personal data or credentials are sent to the translation service. Third-party translation availability is not guaranteed.

Verification: node lib/news-localization.test.cjs; node lib/trail-policy-news.test.cjs; node lib/news-works-regression.test.cjs; npm run build. Full offline corpus verification: 182 article editions. Browser checks cover language switching on both collection and article routes, category query preservation and responsive typography. HTTP checks cover all locale routes and SEO tags.

Backups: backups/news-multilingual. Release preserves the latest production camera repairs by merging origin/main before building.
