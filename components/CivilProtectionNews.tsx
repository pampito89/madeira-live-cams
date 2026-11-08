import Head from 'next/head';
import Link from 'next/link';
import Layout from './Layout';
import type { NewsSnapshot } from '../lib/civilProtectionNews';
import type { UkrainianNewsArticle } from '../lib/civilProtectionUkrainian';

export type UkrainianNewsSnapshot = Omit<NewsSnapshot, 'articles'> & { articles: UkrainianNewsArticle[] };
export function newsDate(date: string) {
  return new Intl.DateTimeFormat('uk-UA', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Atlantic/Madeira' }).format(new Date(date));
}
export default function CivilProtectionNews({ snapshot, article }: { snapshot: UkrainianNewsSnapshot; article?: UkrainianNewsArticle }) {
  const title = article?.title ?? 'Новини цивільного захисту Мадейри';
  const description = article ? article.paragraphs.join(' ').slice(0, 155) : 'Офіційні повідомлення цивільного захисту Мадейри українською: погода, попередження та новини регіону від SRPC, IP-RAM.';
  const url = `https://madeiralivecams.com/uk/news${article ? `/${article.id}` : ''}`;
  const structured = article ? {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: article.title,
    datePublished: article.publishedAt, inLanguage: article.contentLanguage, mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'Serviço Regional de Proteção Civil, IP-RAM', url: 'https://procivmadeira.pt/pt/' },
    isBasedOn: article.sourceUrl,
  } : { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, inLanguage: 'uk', url };
  const languageNote = (item: UkrainianNewsArticle) => item.translationKind === 'original' ? 'Оригінал португальською · переклад тимчасово недоступний' : item.translationKind === 'machine' ? 'Автоматичний переклад українською' : 'Український переклад';
  return <>
    <Head>
      <title>{title} | Madeira Live Cams</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:locale" content="uk_UA" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
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
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">Мадейра · Цивільний захист</p>
          <h1 lang={article?.contentLanguage ?? 'uk'} className="mt-4 break-words text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-white/85">{article ? languageNote(article) : 'Повідомлення Регіональної служби цивільного захисту Мадейри.'}</p>
          {article && <p className="mt-4 text-sm">Опубліковано <time dateTime={article.publishedAt}>{newsDate(article.publishedAt)}</time> · час Мадейри</p>}
        </header>
        {article ? <article className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
          <div lang={article.contentLanguage} className="space-y-5 break-words text-base leading-8 text-slate-700">{article.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          <footer className="mt-8 border-t border-slate-200 pt-6 text-sm leading-6 text-slate-600">
            <p>Джерело: Регіональна служба цивільного захисту Мадейри (SRPC, IP-RAM). Madeira Live Cams — незалежний сайт.</p>
            <a className="mt-3 inline-block font-semibold text-ocean underline" href={article.sourceUrl} target="_blank" rel="noopener noreferrer">Оригінал повідомлення португальською</a>
          </footer>
        </article> : <section aria-label="Останні новини" className="mt-6 grid gap-5 sm:grid-cols-2">
          {snapshot.articles.map(item => <article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ocean">Цивільний захист Мадейри</p>
            <time className="mt-3 text-sm text-slate-500" dateTime={item.publishedAt}>{newsDate(item.publishedAt)}</time>
            <h2 lang={item.contentLanguage} className="mt-3 break-words text-xl font-bold leading-7 text-navy"><Link href={`/news/${item.id}`} locale="uk" className="hover:text-ocean hover:underline">{item.title}</Link></h2>
            <p lang={item.contentLanguage} className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{item.paragraphs.find(paragraph => paragraph.length > 80) ?? item.paragraphs[0]}</p>
            {item.translationKind !== 'edited' && <p className="mt-3 text-xs text-slate-500">{languageNote(item)}</p>}
            <Link href={`/news/${item.id}`} locale="uk" className="mt-auto inline-flex min-h-11 items-center pt-5 font-semibold text-ocean hover:underline" aria-label={`Читати: ${item.title}`}>Читати новину <span aria-hidden="true" className="ml-2">→</span></Link>
          </article>)}
        </section>}
      </div>
    </Layout>
  </>;
}
