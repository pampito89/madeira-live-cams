import Head from 'next/head';
import Link from 'next/link';
import Layout from './Layout';
import type { NewsArticle, NewsSnapshot } from '../lib/civilProtectionNews';

export function newsDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Atlantic/Madeira' }).format(new Date(date));
}
export default function CivilProtectionNews({ snapshot, article }: { snapshot: NewsSnapshot; article?: NewsArticle }) {
  const title = article?.title ?? 'Madeira Civil Protection news';
  const description = article ? article.paragraphs.join(' ').slice(0, 155) : 'Read Madeira Civil Protection announcements on Madeira Live Cams, automatically updated from the official SRPC, IP-RAM RSS feed.';
  const url = `https://madeiralivecams.com/news${article ? `/${article.id}` : ''}`;
  const structured = article ? {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: article.title,
    datePublished: article.publishedAt, inLanguage: 'pt', mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'Serviço Regional de Proteção Civil, IP-RAM', url: 'https://procivmadeira.pt/pt/' },
    isBasedOn: article.sourceUrl,
  } : { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, url };
  return <>
    <Head>
      <title>{title} | Madeira Live Cams</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, '\\u003c') }} />
    </Head>
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12" lang="en">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-2 text-sm text-ocean">
          <Link href="/" locale="en" className="hover:underline">Home</Link><span aria-hidden="true">/</span>
          {article ? <Link href="/news" locale="en" className="hover:underline">Civil Protection news</Link> : <span aria-current="page">Civil Protection news</span>}
          {article && <><span aria-hidden="true">/</span><span aria-current="page">Announcement</span></>}
        </nav>
        <header className="rounded-3xl bg-navy p-6 text-white sm:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">Madeira · Civil Protection</p>
          <h1 lang={article ? 'pt' : 'en'} className="mt-4 break-words text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-white/85">{article ? 'Official RSS announcement · Original Portuguese text' : 'Announcements from Serviço Regional de Proteção Civil, IP-RAM. Open any story to read it here on Madeira Live Cams.'}</p>
          {article && <p className="mt-4 text-sm">Published <time dateTime={article.publishedAt}>{newsDate(article.publishedAt)}</time> · Madeira time</p>}
        </header>
        <div className={`my-6 rounded-2xl border p-4 text-sm leading-6 ${snapshot.stale ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-slate-200 bg-white text-slate-600'}`}>
          <p>{snapshot.stale ? 'The official feed is temporarily unavailable. Showing saved announcements.' : 'Automatically checked on visits, at most every 10 minutes.'}</p>
          <p>Last successful check: <time dateTime={snapshot.checkedAt}>{newsDate(snapshot.checkedAt)}</time> · Madeira time.</p>
          <p>Publication dates are not live alert status. Earlier announcements may have been superseded.</p>
        </div>
        {article ? <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
          <div lang="pt" className="space-y-5 break-words text-base leading-8 text-slate-700">{article.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          <footer className="mt-8 border-t border-slate-200 pt-6 text-sm leading-6 text-slate-600">
            <p>Source: Serviço Regional de Proteção Civil, IP-RAM. Text supplied through its public RSS feed; formatting adapted. Madeira Live Cams is an independent website.</p>
            <a className="mt-3 inline-block font-semibold text-ocean underline" href={article.sourceUrl} target="_blank" rel="noopener noreferrer">View original announcement (Portuguese)</a>
          </footer>
        </article> : <section aria-label="Latest announcements" className="grid gap-5 sm:grid-cols-2">
          {snapshot.articles.map(item => <article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-ocean">SRPC, IP-RAM · Portuguese</p>
            <time className="mt-3 text-sm text-slate-500" dateTime={item.publishedAt}>{newsDate(item.publishedAt)}</time>
            <h2 lang="pt" className="mt-3 break-words text-xl font-bold leading-7 text-navy"><Link href={`/news/${item.id}`} locale="en" className="hover:text-ocean hover:underline">{item.title}</Link></h2>
            <p lang="pt" className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{item.paragraphs.find(paragraph => paragraph.length > 80) ?? item.paragraphs[0]}</p>
            <Link href={`/news/${item.id}`} locale="en" className="mt-auto inline-flex min-h-11 items-center pt-5 font-semibold text-ocean hover:underline" aria-label={`Read: ${item.title}`}>Read announcement <span aria-hidden="true" className="ml-2">→</span></Link>
          </article>)}
        </section>}
      </div>
    </Layout>
  </>;
}
