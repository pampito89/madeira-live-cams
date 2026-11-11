import Head from 'next/head';
import Link from 'next/link';
import Layout from './Layout';
import { newsCategories, type SiteNewsArticle, type SiteNewsSnapshot } from '../lib/newsTypes';
import styles from '../styles/news.module.css';

function newsDate(date: string) {
  return new Intl.DateTimeFormat('uk-UA', { dateStyle: 'long', ...(date.length > 10 ? { timeStyle: 'short' as const } : {}), timeZone: 'Atlantic/Madeira' }).format(new Date(date));
}
const languageNote = (item: SiteNewsArticle) => item.translationKind === 'original' ? 'Оригінал португальською · переклад недоступний' : item.translationKind === 'machine' ? 'Автоматичний переклад' : '';
function Emphasis({ text }: { text: string }) {
  // Preserve source wording; emphasize only explicit amounts, route codes and Ukrainian dates.
  const pattern = /(€\s*\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s*(?:€|євро)|\b(?:PR|ER)\s*\d+(?:\.\d+)?\b|\d{1,2}\s+(?:січня|лютого|березня|квітня|травня|червня|липня|серпня|вересня|жовтня|листопада|грудня)\s+\d{4}(?:\s+року)?)/g;
  return <>{text.split(pattern).map((part, index) => index % 2 ? <strong key={index}>{part}</strong> : part)}</>;
}
function ArticleText({ item }: { item: SiteNewsArticle }) {
  return <div lang={item.contentLanguage} className={styles.body}>{item.paragraphs.map((paragraph, index) => {
    const entries = paragraph.split(/;\s+/);
    // Explicit semicolon-separated entries are a list; do not infer or rewrite facts.
    if (entries.length >= 3) return <ul key={index}>{entries.map((entry, i) => <li key={i}><Emphasis text={entry + (i < entries.length - 1 ? ';' : '')} /></li>)}</ul>;
    return <p key={index} className={index === 0 ? styles.lead : undefined}><Emphasis text={paragraph} /></p>;
  })}</div>;
}
function artwork(item?: SiteNewsArticle) {
  if (!item) return 'news-roads-madeira';
  if (item.categories.includes('roads')) return 'news-roads-v2';
  if (item.categories.includes('trails')) return 'news-trails-v2';
  if (item.categories.includes('weather') || /aviso|meteorolog|depress|негод|погод|опад|шторм|депрес/i.test(item.title)) return 'news-weather-v2';
  return 'news-general-v2';
}
function Details({ item }: { item: SiteNewsArticle }) {
  if (item.id.startsWith('dre-status')) return null;
  return <>
    <div className={styles.meta}><span>{item.location}</span>{item.publishedAt && <time dateTime={item.publishedAt}>{newsDate(item.publishedAt)}</time>}</div>
    {item.period && <p className={styles.period}><Emphasis text={item.period} /></p>}
  </>;
}
function NewsBackground({ item, compact = false }: { item?: SiteNewsArticle; compact?: boolean }) {
  const image = artwork(item);
  return <>
    <img src={`/images/${image}-960.jpg`} srcSet={`/images/${image}-480.jpg 480w, /images/${image}-960.jpg 960w`} sizes={compact ? '(max-width: 640px) 100vw, 480px' : '(max-width: 640px) 100vw, 960px'} width={960} height={640} alt="" aria-hidden="true" loading={compact ? 'lazy' : 'eager'} decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
    <div aria-hidden="true" className={`absolute inset-0 -z-10 ${compact ? 'bg-gradient-to-b from-[#05141c]/45 via-[#05141c]/80 to-[#05141c]/95' : 'bg-gradient-to-r from-[#092b22]/90 via-[#092b22]/65 to-[#092b22]/20'}`} />
  </>;
}
function Status({ item }: { item: SiteNewsArticle }) {
  if (!item.newsState || item.newsState === 'current') return null;
  return <div className="mb-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
    <p className="font-semibold">{item.newsState === 'archived' ? 'Архівне повідомлення' : 'Потребує перевірки'}</p><p>{item.archiveReason}</p>
    {item.replacementId && <Link href={`/news/${item.replacementId}`} locale="uk" className="font-semibold underline">Перейти до нового повідомлення →</Link>}
  </div>;
}
function NewsCard({ item }: { item: SiteNewsArticle }) {
  return <article className="relative isolate flex min-w-0 flex-col overflow-hidden rounded-2xl bg-forest text-white shadow-sm">
    <NewsBackground item={item} compact />
    <div className="flex min-h-[300px] flex-1 flex-col gap-5 p-5 sm:p-7">
      <p className="self-start rounded-full border border-white/35 bg-[#061821]/80 px-3 py-1.5 text-xs font-semibold text-white">{item.sourceName}</p>
      <div className="mt-auto">
        <h3 lang={item.contentLanguage} className={styles.cardTitle}><Link href={`/news/${item.id}`} locale="uk" className="hover:underline">{item.title}</Link></h3>
        <Details item={item} />
        <p lang={item.contentLanguage} className={styles.excerpt}><Emphasis text={item.paragraphs[0] ?? ''} /></p>
        {languageNote(item) && <p className={styles.note}>{languageNote(item)}</p>}
        <Link href={`/news/${item.id}`} locale="uk" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-slate-100" aria-label={`Читати: ${item.title}`}>Докладніше <span aria-hidden="true" className="ml-2">→</span></Link>
      </div>
    </div>
  </article>;
}
function OlderNews({ items, archive }: { items: SiteNewsArticle[]; archive: boolean }) {
  if (!items.length) return null;
  return <details className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" id={archive ? 'archive' : 'unverified'}>
    <summary className="min-h-11 cursor-pointer text-lg font-bold text-navy">{archive ? 'Архів новин' : 'Потребують перевірки'} ({items.length})</summary>
    <ul className="mt-3 divide-y divide-slate-200">{items.map(item => <li key={item.id} className="py-4">
      <Link href={`/news/${item.id}`} locale="uk" lang={item.contentLanguage} className="font-semibold leading-6 text-ocean hover:underline">{item.title}</Link>
      {item.publishedAt && <p className="mt-1 text-xs text-slate-500"><time dateTime={item.publishedAt}>{newsDate(item.publishedAt)}</time></p>}
      <p className="mt-1 text-sm leading-6 text-slate-600">{item.archiveReason}</p>
      {item.replacementId && <Link href={`/news/${item.replacementId}`} locale="uk" className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-ocean underline">Нове повідомлення →</Link>}
    </li>)}</ul>
  </details>;
}
export default function CivilProtectionNews({ snapshot, article, category = 'all' }: { snapshot: SiteNewsSnapshot; article?: SiteNewsArticle; category?: keyof typeof newsCategories }) {
  const title = article?.title ?? 'Новини та обмеження на Мадейрі';
  const description = article ? article.paragraphs.join(' ').slice(0, 155) : 'Стежки, дороги, негода, тарифи та правила маршрутів Мадейри. Повідомлення IFCN, DRE, SRPC і RTP Madeira та архів новин.';
  const url = `https://madeiralivecams.com/uk/news${article ? `/${article.id}` : ''}`;
  const image = `https://madeiralivecams.com/images/${artwork(article)}-960.jpg`;
  const structured = article ? {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: article.title,
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}), inLanguage: article.contentLanguage, mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'Madeira Live Cams' }, isBasedOn: article.sourceUrl,
  } : { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, inLanguage: 'uk', url };
  const active = snapshot.articles.filter(item => !item.newsState || item.newsState === 'current');
  const matches = (item: SiteNewsArticle) => category === 'all' || item.categories.includes(category);
  const visible = active.filter(matches);
  const archived = snapshot.articles.filter(item => item.newsState === 'archived' && matches(item));
  const unverified = snapshot.articles.filter(item => item.newsState === 'unverified' && matches(item));
  return <>
    <Head>
      <title>{title} | Madeira Live Cams</title><meta name="description" content={description} />
      <meta property="og:title" content={title} /><meta property="og:description" content={description} />
      <meta property="og:type" content={article ? 'article' : 'website'} /><meta property="og:locale" content="uk_UA" />
      <meta property="og:image" content={image} /><meta property="og:image:alt" content="Тематична ілюстрація розділу" />
      <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:image" content={image} /><meta name="twitter:title" content={title} /><meta name="twitter:description" content={description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }} />
    </Head>
    <Layout>
      <div className={`${styles.page} mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12`} lang="uk">
        <nav aria-label="Навігаційний шлях" className="mb-6 flex flex-wrap gap-2 text-sm text-ocean">
          <Link href="/" locale="uk" className="hover:underline">Головна</Link><span aria-hidden="true">/</span>
          {article ? <Link href="/news" locale="uk" className="hover:underline">Новини</Link> : <span aria-current="page">Новини</span>}
          {article && <><span aria-hidden="true">/</span><span aria-current="page">Повідомлення</span></>}
        </nav>
        <header className="relative isolate overflow-hidden rounded-2xl bg-forest px-5 py-6 text-white shadow-lg shadow-forest/15 sm:px-8 sm:py-7">
          <NewsBackground item={article} />
          <div className="max-w-2xl">
            <h1 lang={article?.contentLanguage ?? 'uk'} className={styles.title}>{title}</h1>
            {!article && <p className="mt-3 max-w-md text-sm leading-6 text-white/90 sm:text-base">Стежки, дороги, негода та тарифи</p>}
            {article && languageNote(article) && <p className="mt-3 text-sm text-white/90">{languageNote(article)}</p>}
          </div>
        </header>
        {article ? <article className={styles.article}><div className={styles.reading}>
          <Status item={article} /><Details item={article} /><ArticleText item={article} />
          <footer className={styles.source}><a className="font-semibold text-ocean underline" href={article.sourceUrl} target="_blank" rel="noopener noreferrer">Джерело: {article.sourceName}</a></footer>
        </div></article> : <>
          <nav aria-label="Категорії новин" className="mt-6 flex flex-wrap gap-2">
            {(Object.keys(newsCategories) as (keyof typeof newsCategories)[]).map(key => <Link key={key} href={key === 'all' ? '/news' : `/news?category=${key}`} locale="uk" aria-current={category === key ? 'page' : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold ${category === key ? 'border-navy bg-navy text-white' : 'border-slate-300 bg-white text-navy hover:bg-slate-100'}`}>{newsCategories[key]} ({active.filter(item => key === 'all' || item.categories.includes(key)).length})</Link>)}
          </nav>
          <section aria-label="Актуальні повідомлення" className="mt-6">
            <h2 className="mb-4 text-xl font-bold text-navy">Актуальні повідомлення</h2>
            <div className="grid gap-5 sm:grid-cols-2">{visible.map(item => <NewsCard key={item.id} item={item} />)}</div>
            {!visible.length && <p className="py-6 text-slate-600">Актуальних повідомлень у цій категорії немає. Це не підтверджує відсутності обмежень.</p>}
          </section>
          <OlderNews items={unverified} archive={false} /><OlderNews items={archived} archive />
        </>}
      </div>
    </Layout>
  </>;
}
