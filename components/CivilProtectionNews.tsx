import Head from 'next/head';
import Link from 'next/link';
import Layout from './Layout';
import { newsCategories, type SiteNewsArticle, type SiteNewsSnapshot } from '../lib/newsTypes';

export function newsDate(date: string) {
  return new Intl.DateTimeFormat('uk-UA', { dateStyle: 'long', ...(date.length > 10 ? { timeStyle: 'short' as const } : {}), timeZone: 'Atlantic/Madeira' }).format(new Date(date));
}
const languageNote = (item: SiteNewsArticle) => item.translationKind === 'original' ? 'Оригінал португальською · переклад недоступний' : item.translationKind === 'machine' ? 'Автоматичний переклад' : '';
function Details({ item }: { item: SiteNewsArticle }) {
  return <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
    {item.id !== 'dre-status' && <><p>{item.location}</p>{item.period && <p>{item.period}</p>}{item.publishedAt && <time dateTime={item.publishedAt}>{newsDate(item.publishedAt)}</time>}</>}
    {item.stale && <p className="text-amber-800">Збережене повідомлення · актуальність не підтверджено.</p>}
  </div>;
}
function NewsImage({ compact = false }: { compact?: boolean }) {
  return <img src="/images/news-roads-madeira-960.jpg" srcSet="/images/news-roads-madeira-480.jpg 480w, /images/news-roads-madeira-960.jpg 960w" sizes={compact ? '(max-width: 640px) 100vw, 480px' : '(max-width: 640px) 100vw, 960px'} width={960} height={640} alt="Ілюстрація гірської дороги та стежки на Мадейрі з огорожами" loading={compact ? 'lazy' : 'eager'} decoding="async" className={`w-full object-cover ${compact ? 'aspect-[2/1]' : 'aspect-[2/1] sm:aspect-[5/2]'}`} />;
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
        <header className="overflow-hidden rounded-3xl bg-navy text-white">
          {illustrated && <NewsImage />}
          <div className="p-6 sm:p-8">
            <h1 lang={article?.contentLanguage ?? 'uk'} className="break-words text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
            {!article && <p className="mt-3 text-white/85">Стежки, дороги та негода · IFCN, DRE, SRPC</p>}
            {article && languageNote(article) && <p className="mt-3 text-sm text-white/85">{languageNote(article)}</p>}
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
            {visible.map(item => <article key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {item.id === 'dre-status' && <NewsImage compact />}
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-ocean">{item.sourceName}</p>
                <h2 lang={item.contentLanguage} className="mt-3 break-words text-xl font-bold leading-7 text-navy"><Link href={`/news/${item.id}`} locale="uk" className="hover:text-ocean hover:underline">{item.title}</Link></h2>
                <Details item={item} />
                <p lang={item.contentLanguage} className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.paragraphs[0]}</p>
                {languageNote(item) && <p className="mt-3 text-xs text-slate-500">{languageNote(item)}</p>}
                <Link href={`/news/${item.id}`} locale="uk" className="mt-auto inline-flex min-h-11 items-center pt-4 font-semibold text-ocean hover:underline" aria-label={`Читати: ${item.title}`}>Докладніше <span aria-hidden="true" className="ml-2">→</span></Link>
              </div>
            </article>)}
            {!visible.length && <p className="py-8 text-slate-600">У цій категорії поки немає повідомлень.</p>}
          </section>
        </>}
      </div>
    </Layout>
  </>;
}
