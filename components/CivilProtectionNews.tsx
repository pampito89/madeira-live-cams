import Head from 'next/head';
import Link from 'next/link';
import Layout from './Layout';
import { newsCategories, type SiteNewsArticle, type SiteNewsSnapshot } from '../lib/newsTypes';

export function newsDate(date: string) {
  return new Intl.DateTimeFormat('uk-UA', { dateStyle: 'long', ...(date.length > 10 ? { timeStyle: 'short' as const } : {}), timeZone: 'Atlantic/Madeira' }).format(new Date(date));
}
const languageNote = (item: SiteNewsArticle) => item.translationKind === 'original' ? 'Оригінал португальською · переклад недоступний' : item.translationKind === 'machine' ? 'Автоматичний переклад' : '';
function Details({ item, overlay = false }: { item: SiteNewsArticle; overlay?: boolean }) {
  return <div className={`mt-3 space-y-2 text-sm leading-6 ${overlay ? 'text-white/90' : 'text-slate-600'}`}>
    {item.id !== 'dre-status' && <><p>{item.location}</p>{item.period && <p>{item.period}</p>}{item.publishedAt && <time dateTime={item.publishedAt}>{newsDate(item.publishedAt)}</time>}</>}
    {item.stale && <p className={overlay ? 'text-amber-100' : 'text-amber-800'}>Збережене повідомлення · актуальність не підтверджено.</p>}
  </div>;
}
function NewsBackground({ compact = false }: { compact?: boolean }) {
  return <>
    <img src="/images/news-roads-madeira-960.jpg" srcSet="/images/news-roads-madeira-480.jpg 480w, /images/news-roads-madeira-960.jpg 960w" sizes={compact ? '(max-width: 640px) 100vw, 480px' : '(max-width: 640px) 100vw, 960px'} width={960} height={640} alt="" aria-hidden="true" loading={compact ? 'lazy' : 'eager'} decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_65%]" />
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#092b22]/95 via-[#092b22]/75 to-[#092b22]/20" />
  </>;
}
export default function CivilProtectionNews({ snapshot, article, category = 'all' }: { snapshot: SiteNewsSnapshot; article?: SiteNewsArticle; category?: keyof typeof newsCategories }) {
  const title = article?.title ?? 'Новини та обмеження на Мадейрі';
  const description = article ? article.paragraphs.join(' ').slice(0, 155) : 'Закриття стежок, обвали, перекриття доріг і ремонтні роботи на Мадейрі. Офіційні повідомлення IFCN, DRE та SRPC українською.';
  const url = `https://madeiralivecams.com/uk/news${article ? `/${article.id}` : ''}`;
  const illustrated = !article || article.id === 'dre-status';
  const structured = article ? {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: article.title,
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}), inLanguage: article.contentLanguage, mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'Madeira Live Cams' }, isBasedOn: article.sourceUrl,
  } : { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, inLanguage: 'uk', url };
  const visible = snapshot.articles.filter(item => category === 'all' || item.categories.includes(category));
  return <>
    <Head>
      <title>{title} | Madeira Live Cams</title><meta name="description" content={description} />
      <meta property="og:title" content={title} /><meta property="og:description" content={description} />
      <meta property="og:type" content={article ? 'article' : 'website'} /><meta property="og:locale" content="uk_UA" />
      {illustrated && <meta property="og:image" content="https://madeiralivecams.com/images/news-roads-madeira-960.jpg" />}
      <meta name="twitter:card" content={illustrated ? 'summary_large_image' : 'summary'} /><meta name="twitter:title" content={title} /><meta name="twitter:description" content={description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }} />
    </Head>
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12" lang="uk">
        <nav aria-label="Навігаційний шлях" className="mb-6 flex flex-wrap gap-2 text-sm text-ocean">
          <Link href="/" locale="uk" className="hover:underline">Головна</Link><span aria-hidden="true">/</span>
          {article ? <Link href="/news" locale="uk" className="hover:underline">Новини</Link> : <span aria-current="page">Новини</span>}
          {article && <><span aria-hidden="true">/</span><span aria-current="page">Повідомлення</span></>}
        </nav>
        <header className="relative isolate overflow-hidden rounded-2xl bg-forest px-5 py-6 text-white shadow-lg shadow-forest/15 sm:px-8 sm:py-7">
          {illustrated && <NewsBackground />}
          <div className="max-w-xl">
            <h1 lang={article?.contentLanguage ?? 'uk'} className="break-words text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            {!article && <p className="mt-3 max-w-md text-sm leading-6 text-white/90 sm:text-base">Стежки, дороги та негода · IFCN, DRE, SRPC</p>}
            {article && languageNote(article) && <p className="mt-3 text-sm text-white/90">{languageNote(article)}</p>}
          </div>
        </header>
        {article ? <article className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <Details item={article} />
          <div lang={article.contentLanguage} className="space-y-3 break-words text-base leading-7 text-slate-700">{article.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          <footer className="mt-5 border-t border-slate-200 pt-4 text-sm">
            <a className="font-semibold text-ocean underline" href={article.sourceUrl} target="_blank" rel="noopener noreferrer">Джерело: {article.sourceName}</a>
          </footer>
        </article> : <>
          <nav aria-label="Категорії новин" className="mt-6 flex flex-wrap gap-2">
            {(Object.keys(newsCategories) as (keyof typeof newsCategories)[]).map(key => <Link key={key} href={key === 'all' ? '/news' : `/news?category=${key}`} locale="uk" aria-current={category === key ? 'page' : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold ${category === key ? 'border-navy bg-navy text-white' : 'border-slate-300 bg-white text-navy hover:bg-slate-100'}`}>{newsCategories[key]} ({snapshot.articles.filter(item => key === 'all' || item.categories.includes(key)).length})</Link>)}
          </nav>
          <section aria-label={newsCategories[category]} className="mt-6 grid gap-5 sm:grid-cols-2">
            {visible.map(item => {
              const overlay = item.id === 'dre-status';
              return <article key={item.id} className={`relative isolate flex flex-col overflow-hidden rounded-2xl border shadow-sm ${overlay ? 'border-forest bg-forest text-white' : 'border-slate-200 bg-white'}`}>
                {overlay && <NewsBackground compact />}
                <div className="flex flex-1 flex-col p-6">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${overlay ? 'text-white/90' : 'text-ocean'}`}>{item.sourceName}</p>
                  <h2 lang={item.contentLanguage} className={`mt-3 break-words text-xl font-bold leading-7 ${overlay ? 'text-white' : 'text-navy'}`}><Link href={`/news/${item.id}`} locale="uk" className="hover:underline">{item.title}</Link></h2>
                  <Details item={item} overlay={overlay} />
                  <p lang={item.contentLanguage} className={`mt-3 line-clamp-3 text-sm leading-6 ${overlay ? 'text-white/90' : 'text-slate-600'}`}>{item.paragraphs[0]}</p>
                  {languageNote(item) && <p className={`mt-3 text-xs ${overlay ? 'text-white/90' : 'text-slate-500'}`}>{languageNote(item)}</p>}
                  <Link href={`/news/${item.id}`} locale="uk" className={`mt-auto inline-flex min-h-11 items-center pt-4 font-semibold hover:underline ${overlay ? 'text-white' : 'text-ocean'}`} aria-label={`Читати: ${item.title}`}>Докладніше <span aria-hidden="true" className="ml-2">→</span></Link>
                </div>
              </article>;
            })}
            {!visible.length && <p className="py-8 text-slate-600">У цій категорії поки немає повідомлень.</p>}
          </section>
        </>}
      </div>
    </Layout>
  </>;
}
