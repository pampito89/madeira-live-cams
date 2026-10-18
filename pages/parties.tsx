import { withStaticTranslations, withServerTranslations, translatedStaticProps } from '../lib/i18n/pageTranslations';
import { useText } from '../lib/i18n/TranslationProvider';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { partyPageText } from '../lib/i18n/partyPage';
import { useMessages } from '../lib/i18n/useMessages';
type PartyEvent = {
    name: string;
    description: string;
    startDate: string | null;
    venue: string | null;
    address: string | null;
    image: string | null;
    eventUrl: string;
};
type Result = {
    event: PartyEvent | null;
    instagramUrl?: string;
    error?: string;
};
function dateTime(value: string, intlLocale: string) {
    return new Intl.DateTimeFormat(intlLocale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Atlantic/Madeira',
    }).format(new Date(value));
}
export default function PartiesPage() {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
    const { siteLocale } = useMessages();
    const content = partyPageText[siteLocale];
    const [result, setResult] = useState<Result | null>(null);
    useEffect(() => {
        fetch('/api/parties/current')
            .then((response) => response.json())
            .then((data: Result) => setResult(data))
            .catch(() => setResult({ event: null, error: content.loadError }));
    }, [content.loadError]);
    const instagramUrl = result?.instagramUrl || 'https://www.instagram.com/thepurplefridays/';
    return (<Layout>
      <Head>
        <title>{[localize(content.pageTitle)].join("")}</title>
        <meta name="description" content={localize(content.pageDescription)}/>
        <meta property="og:title" content={localize(content.pageTitle)}/>
        <meta property="og:description" content={localize(content.pageDescription)}/>
        <meta property="og:type" content="website"/>
      <meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content={localize(content.pageTitle)}/><meta name="twitter:description" content={localize(content.pageDescription)}/></Head>

      <main className="page-shell">
        <section className="mb-6 rounded-2xl bg-gradient-to-br from-[#26133f] via-[#59347a] to-[#d7688d] px-5 py-8 text-white shadow-lg sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">{localize(content.eyebrow)}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{localize(content.title)}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 sm:text-base">{localize(content.intro)}</p>
        </section>

        {localize(!result && (<section className="rounded-2xl border border-moss/50 bg-white p-6 text-sm text-slate-600 shadow-sm" aria-live="polite">
            {localize(content.loading)}
          </section>))}

        {localize(result?.event && (<article className="overflow-hidden rounded-2xl border border-moss/50 bg-white shadow-sm">
            {localize(result.event.image && <img src={result.event.image} alt={localize(result.event.name)} className="h-56 w-full object-cover sm:h-80"/>)}
            <div className="p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ocean">{localize(content.currentEvent)}</p>
              <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">{localize(result.event.name)}</h2>
              {localize(result.event.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{localize(result.event.description)}</p>)}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {localize(result.event.startDate && (<div className="rounded-xl bg-panel p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">{localize(content.dateTime)}</p>
                    <p className="mt-1 text-sm font-semibold text-navy">{localize(dateTime(result.event.startDate, content.intlLocale))}</p>
                  </div>))}
                {localize((result.event.venue || result.event.address) && (<div className="rounded-xl bg-panel p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">{localize(content.location)}</p>
                    {localize(result.event.venue && <p className="mt-1 text-sm font-semibold text-navy">{localize(result.event.venue)}</p>)}
                    {localize(result.event.address && <p className="mt-1 text-sm text-slate-600">{localize(result.event.address)}</p>)}
                  </div>))}
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <a href={result.event.eventUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-lg bg-ocean px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest">
                  {localize(content.tickets)}
                </a>
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-lg border border-ocean bg-white px-4 py-3 text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white">
                  {localize(content.organiserInstagram)}
                </a>
              </div>
            </div>
          </article>))}

        {localize(result && !result.event && (<section className="rounded-2xl border border-moss/50 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-navy">{localize("The Purple Fridays")}</h2>
            <p className="mt-2 text-sm text-slate-600">{localize(result.error ? content.loadError : content.noEvent)}</p>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-lg bg-ocean px-4 py-3 text-sm font-semibold text-white">{localize("Instagram")}</a>
          </section>))}
      </main>
    </Layout>);
}
export const getStaticProps = translatedStaticProps("/parties");
