import Head from 'next/head';
import Link from 'next/link';
import Layout from './Layout';
import { newsCategories, type SiteNewsArticle, type SiteNewsSnapshot } from '../lib/newsTypes';

export function newsDate(date: string) {
  return new Intl.DateTimeFormat('uk-UA', { dateStyle: 'long', ...(date.length > 10 ? { timeStyle: 'short' as const } : {}), timeZone: 'Atlantic/Madeira' }).format(new Date(date));
}
const languageNote = (item: SiteNewsArticle) => item.translationKind === 'original' ? 'Оригінал португальською · переклад тимчасово недоступний' : item.translationKind === 'machine' ? 'Автоматичний переклад українською' : 'Український виклад офіційного повідомлення';
function Details({ item }: { item: SiteNewsArticle }) {
  return <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
    <p className="font-semibold">{item.location}</p>
    {item.period && <p>Період: {item.period}</p>}
    <p>{item.publishedAt ? <>{item.id === 'dre-status' ? 'Оновлення джерела: ' : 'Опубліковано: '}<time dateTime={item.publishedAt}>{newsDate(item.publishedAt)}</time></> : 'Джерело не вказує дату публікації'}</p>
    {item.stale && <p className="text-amber-800">Оновити джерело не вдалося. Показано збережене повідомлення.</p>}
  </div>;
}
export default function CivilProtectionNews({ snapshot, article, category = 'all' }: { snapshot: SiteNewsSnapshot; article?: SiteNewsArticle; category?: keyof typeof newsCategories }) {
  const title = article?.title ?? 'Новини та обмеження на Мадейрі';
  const description = article ? article.paragraphs.join(' ').slice(0, 155) : 'Офіційні повідомлення Мадейри українською: закриття стежок, обвали, перекриття доріг, ремонтні роботи та негода. Джерела: IFCN, DRE та SRPC.';
  const url = `https://madeiralivecams.com/uk/news${article ? `/${article.id}` : ''}`;
  const structured = article ? {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: article.title,
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}), inLanguage: article.contentLanguage, mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'Madeira Live Cams' }, isBasedOn: article.sourceUrl,
  } : { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, inLanguage: 'uk', url };
  const visible = snapshot.articles.filter(item => category === 'all' || item.categories.includes(category));
  return <>
    <Head>
      <title>{title} | Madeira Live Cams</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} /><meta property="og:description" content={description} />
      <meta property="og:type" content={article ? 'article' : 'website'} /><meta property="og:locale" content="uk_UA" />
      <meta name="twitter:card" content="summary" /><meta name="twitter:title" content={title} /><meta name="twitter:description" content={description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }} />
    </Head>
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12" lang="uk">
        <nav aria-label="Навігаційний шлях" className="mb-6 flex flex-wrap gap-2 text-sm text-ocean">
          <Link href="/" locale="uk" className="hover:underline">Головна</Link><span aria-hidden="true">/</span>
          {article ? <Link href="/news" locale="uk" className="hover:underline">Новини</Link> : <span aria-current="page">Новини</span>}
          {article && <><span aria-hidden="true">/</span><span aria-current="page">Повідомлення</span></>}
        </nav>
        <header className="rounded-3xl bg-navy p-6 text-white sm:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">Мадейра · Офіційні повідомлення</p>
          <h1 lang={article?.contentLanguage ?? 'uk'} className="mt-4 break-words text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-white/85">{article ? languageNote(article) : 'Стежки, дороги та негода — повідомлення IFCN, дорожньої служби й цивільного захисту.'}</p>
        </header>
        {article ? <article className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
          <Details item={article} />
          <div lang={article.contentLanguage} className="mt-6 space-y-5 break-words text-base leading-8 text-slate-700">{article.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          <footer className="mt-8 border-t border-slate-200 pt-6 text-sm leading-6 text-slate-600">
            <p>Джерело: {article.sourceName}. Madeira Live Cams — незалежний сайт.</p>
            <p>Отримано з джерела: <time dateTime={article.checkedAt}>{newsDate(article.checkedAt)}</time> · час Мадейри.</p>
            <p>Повідомлення описує зазначений період; воно не підтверджує поточну доступність маршруту чи дороги.</p>
            <a className="mt-3 inline-block font-semibold text-ocean underline" href={article.sourceUrl} target="_blank" rel="noopener noreferrer">Офіційне першоджерело</a>
          </footer>
        </article> : <>
          <nav aria-label="Категорії новин" className="mt-6 flex flex-wrap gap-2">
            {(Object.keys(newsCategories) as (keyof typeof newsCategories)[]).map(key => <Link key={key} href={key === 'all' ? '/news' : `/news?category=${key}`} locale="uk" aria-current={category === key ? 'page' : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold ${category === key ? 'border-navy bg-navy text-white' : 'border-slate-300 bg-white text-navy hover:bg-slate-100'}`}>{newsCategories[key]} ({snapshot.articles.filter(item => key === 'all' || item.categories.includes(key)).length})</Link>)}
          </nav>
          <section aria-label={newsCategories[category]} className="mt-6 grid gap-5 sm:grid-cols-2">
            {visible.map(item => <article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-ocean">{item.sourceName}</p>
              <h2 lang={item.contentLanguage} className="mt-3 break-words text-xl font-bold leading-7 text-navy"><Link href={`/news/${item.id}`} locale="uk" className="hover:text-ocean hover:underline">{item.title}</Link></h2>
              <Details item={item} />
              <p lang={item.contentLanguage} className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{item.paragraphs[0]}</p>
              {item.translationKind !== 'edited' && <p className="mt-3 text-xs text-slate-500">{languageNote(item)}</p>}
              <Link href={`/news/${item.id}`} locale="uk" className="mt-auto inline-flex min-h-11 items-center pt-5 font-semibold text-ocean hover:underline" aria-label={`Читати: ${item.title}`}>Читати повідомлення <span aria-hidden="true" className="ml-2">→</span></Link>
            </article>)}
            {!visible.length && <p className="py-8 text-slate-600">У цій категорії поки немає повідомлень.</p>}
          </section>
        </>}
      </div>
    </Layout>
  </>;
}
