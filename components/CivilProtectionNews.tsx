import Head from 'next/head';
import Link from 'next/link';
import Layout from './Layout';
import NewsArticleBody, { NewsEmphasis as Emphasis } from './NewsArticleBody';
import { newsCategories, type SiteNewsArticle, type SiteNewsSnapshot } from '../lib/newsTypes';
import { useMessages } from '../lib/i18n/useMessages';
import { newsText } from '../lib/i18n/newsText';
import { localePath, type Locale } from '../lib/i18n/config';
import styles from '../styles/news.module.css';

function newsDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : locale === 'en' ? 'en-GB' : locale, { dateStyle: 'long', ...(date.length > 10 ? { timeStyle: 'short' as const } : {}), timeZone: 'Atlantic/Madeira' }).format(new Date(date));
}
function languageNote(item: SiteNewsArticle, locale: Locale) {
  const t = newsText(locale);
  return item.translationKind === 'original' && item.contentLanguage !== locale ? t.original : item.translationKind === 'machine' ? t.machine : '';
}
function artwork(item?: SiteNewsArticle) {
  if (!item) return 'news-roads-madeira';
  if (item.categories.includes('roads')) return 'news-roads-v2';
  if (item.categories.includes('trails')) return 'news-trails-v2';
  if (item.categories.includes('weather') || /aviso|meteorolog|depress|негод|погод|опад|шторм|депрес|weather|storm|wetter|tempête|temporal|pogod/i.test(item.title)) return 'news-weather-v2';
  return 'news-general-v2';
}
function Details({ item }: { item: SiteNewsArticle }) {
  const { siteLocale } = useMessages();
  if (item.id.startsWith('dre-status')) return null;
  return <><div className={styles.meta}><span>{item.location}</span>{item.publishedAt && <time dateTime={item.publishedAt}>{newsDate(item.publishedAt, siteLocale)}</time>}</div>{item.period && <p className={styles.period}><Emphasis text={item.period} /></p>}</>;
}
function NewsBackground({ item, compact = false }: { item?: SiteNewsArticle; compact?: boolean }) {
  const image = artwork(item);
  return <>
    <img src={`/images/${image}-960.jpg`} srcSet={`/images/${image}-480.jpg 480w, /images/${image}-960.jpg 960w`} sizes={compact ? '(max-width: 640px) 100vw, 480px' : '(max-width: 640px) 100vw, 960px'} width={960} height={640} alt="" aria-hidden="true" loading={compact ? 'lazy' : 'eager'} decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
    <div aria-hidden="true" className={`absolute inset-0 -z-10 ${compact ? 'bg-gradient-to-b from-[#05141c]/45 via-[#05141c]/80 to-[#05141c]/95' : 'bg-gradient-to-r from-[#092b22]/90 via-[#092b22]/65 to-[#092b22]/20'}`} />
  </>;
}
function Status({ item }: { item: SiteNewsArticle }) {
  const { siteLocale } = useMessages(); const t = newsText(siteLocale);
  if (!item.newsState || item.newsState === 'current') return null;
  return <div className="mb-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
    <p className="font-semibold">{item.newsState === 'archived' ? t.archived : t.unverified}</p><p>{item.archiveReason}</p>
    {item.replacementId && <Link href={`/news/${item.replacementId}`} locale={siteLocale} className="font-semibold underline">{t.goNew} →</Link>}
  </div>;
}
function NewsCard({ item }: { item: SiteNewsArticle }) {
  const { siteLocale } = useMessages(); const t = newsText(siteLocale);
  return <article className="relative isolate flex min-w-0 flex-col overflow-hidden rounded-2xl bg-forest text-white shadow-sm">
    <NewsBackground item={item} compact />
    <div className="flex min-h-[300px] flex-1 flex-col gap-5 p-5 sm:p-7">
      <p className="self-start rounded-full border border-white/35 bg-[#061821]/80 px-3 py-1.5 text-xs font-semibold text-white">{item.sourceName}</p>
      <div className="mt-auto">
        <h3 lang={item.contentLanguage} className={styles.cardTitle}><Link href={`/news/${item.id}`} locale={siteLocale} className="hover:underline">{item.title}</Link></h3>
        <Details item={item} />
        <p lang={item.contentLanguage} className={styles.excerpt}><Emphasis text={item.paragraphs[0] ?? ''} /></p>
        {languageNote(item, siteLocale) && <p className={styles.note}>{languageNote(item, siteLocale)}</p>}
        <Link href={`/news/${item.id}`} locale={siteLocale} className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-slate-100" aria-label={`${t.read}: ${item.title}`}>{t.more}<span aria-hidden="true" className="ml-2">→</span></Link>
      </div>
    </div>
  </article>;
}
function OlderNews({ items, archive }: { items: SiteNewsArticle[]; archive: boolean }) {
  const { siteLocale } = useMessages(); const t = newsText(siteLocale);
  if (!items.length) return null;
  return <details className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" id={archive ? 'archive' : 'unverified'}>
    <summary className="min-h-11 cursor-pointer text-lg font-bold text-navy">{archive ? t.archive : t.unverified} ({items.length})</summary>
    <ul className="mt-3 divide-y divide-slate-200">{items.map(item => <li key={item.id} className="py-4">
      <Link href={`/news/${item.id}`} locale={siteLocale} lang={item.contentLanguage} className="font-semibold leading-6 text-ocean hover:underline">{item.title}</Link>
      {item.publishedAt && <p className="mt-1 text-xs text-slate-500"><time dateTime={item.publishedAt}>{newsDate(item.publishedAt, siteLocale)}</time></p>}
      <p className="mt-1 text-sm leading-6 text-slate-600">{item.archiveReason}</p>
      {item.replacementId && <Link href={`/news/${item.replacementId}`} locale={siteLocale} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-ocean underline">{t.newNotice} →</Link>}
    </li>)}</ul>
  </details>;
}
export default function CivilProtectionNews({ snapshot, article, category = 'all' }: { snapshot: SiteNewsSnapshot; article?: SiteNewsArticle; category?: keyof typeof newsCategories }) {
  const { siteLocale } = useMessages(); const t = newsText(siteLocale);
  const title = article?.title ?? t.title;
  const description = article ? article.paragraphs.join(' ').slice(0, 155) : `${t.title}. ${t.subtitle}. IFCN, DRE, SRPC, RTP Madeira.`;
  const url = `https://madeiralivecams.com${localePath(siteLocale, `/news${article ? `/${article.id}` : ''}`)}`;
  const image = `https://madeiralivecams.com/images/${artwork(article)}-960.jpg`;
  const structured = article ? {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: article.title,
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}), inLanguage: article.contentLanguage, mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'Madeira Live Cams' }, isBasedOn: article.sourceUrl,
  } : { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, inLanguage: siteLocale, url };
  const active = snapshot.articles.filter(item => !item.newsState || item.newsState === 'current');
  const matches = (item: SiteNewsArticle) => category === 'all' || item.categories.includes(category);
  const visible = active.filter(matches);
  const archived = snapshot.articles.filter(item => item.newsState === 'archived' && matches(item));
  const unverified = snapshot.articles.filter(item => item.newsState === 'unverified' && matches(item));
  const ogLocale = {en:'en_GB',pt:'pt_PT',de:'de_DE',fr:'fr_FR',es:'es_ES',pl:'pl_PL',uk:'uk_UA'}[siteLocale];
  return <>
    <Head>
      <title>{title} | Madeira Live Cams</title><meta name="description" content={description} />
      <meta property="og:title" content={title} /><meta property="og:description" content={description} />
      <meta property="og:type" content={article ? 'article' : 'website'} /><meta property="og:locale" content={ogLocale} />
      <meta property="og:image" content={image} /><meta property="og:image:alt" content={t.illustration} />
      <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:image" content={image} /><meta name="twitter:title" content={title} /><meta name="twitter:description" content={description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }} />
    </Head>
    <Layout>
      <div className={`${styles.page} mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12`} lang={siteLocale}>
        <nav aria-label={t.home} className="mb-6 flex flex-wrap gap-2 text-sm text-ocean">
          <Link href="/" locale={siteLocale} className="hover:underline">{t.home}</Link><span aria-hidden="true">/</span>
          {article ? <Link href="/news" locale={siteLocale} className="hover:underline">{t.news}</Link> : <span aria-current="page">{t.news}</span>}
          {article && <><span aria-hidden="true">/</span><span aria-current="page">{t.article}</span></>}
        </nav>
        <header className="relative isolate overflow-hidden rounded-2xl bg-forest px-5 py-6 text-white shadow-lg shadow-forest/15 sm:px-8 sm:py-7">
          <NewsBackground item={article} />
          <div className="max-w-2xl">
            <h1 lang={article?.contentLanguage ?? siteLocale} className={styles.title}>{title}</h1>
            {!article && <p className="mt-3 max-w-md text-sm leading-6 text-white/90 sm:text-base">{t.subtitle}</p>}
            {article && languageNote(article, siteLocale) && <p className="mt-3 text-sm text-white/90">{languageNote(article, siteLocale)}</p>}
          </div>
        </header>
        {article ? <article className={styles.article}><div className={styles.reading}>
          <Status item={article} /><Details item={article} /><NewsArticleBody item={article} />
          <footer className={styles.source}>
            <span>{t.source}</span>
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">{article.sourceName} ↗</a>
            {article.additionalSources?.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.name} ↗</a>)}
          </footer>
        </div></article> : <>
          <nav aria-label={t.news} className="mt-6 flex flex-wrap gap-2">
            {(Object.keys(newsCategories) as (keyof typeof newsCategories)[]).map(key => <Link key={key} href={key === 'all' ? '/news' : `/news?category=${key}`} locale={siteLocale} aria-current={category === key ? 'page' : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold ${category === key ? 'border-navy bg-navy text-white' : 'border-slate-300 bg-white text-navy hover:bg-slate-100'}`}>{t.categories[key]} ({active.filter(item => key === 'all' || item.categories.includes(key)).length})</Link>)}
          </nav>
          <section aria-label={t.current} className="mt-6">
            <h2 className="mb-4 text-xl font-bold text-navy">{t.current}</h2>
            <div className="grid gap-5 sm:grid-cols-2">{visible.map(item => <NewsCard key={item.id} item={item} />)}</div>
            {!visible.length && <p className="py-6 text-slate-600">{t.empty}</p>}
          </section>
          <OlderNews items={unverified} archive={false} /><OlderNews items={archived} archive />
        </>}
      </div>
    </Layout>
  </>;
}
