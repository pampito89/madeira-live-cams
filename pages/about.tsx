import { withStaticTranslations, withServerTranslations, translatedStaticProps } from '../lib/i18n/pageTranslations';
import { useText } from '../lib/i18n/TranslationProvider';
import Head from 'next/head';
import Layout from '../components/Layout';
import { aboutPageText } from '../lib/i18n/aboutPage';
import { useMessages } from '../lib/i18n/useMessages';
export default function AboutPage() {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
    const { siteLocale } = useMessages();
    const content = aboutPageText[siteLocale];
    const whatsappUrl = `https://wa.me/351932006352?text=${encodeURIComponent(content.whatsappMessage)}`;
    return (<>
      <Head>
        <title>{[localize(content.title), localize(" | Madeira Live Cams")].join("")}</title>
        <meta name="description" content={localize(content.description)}/>
        <meta property="og:title" content={localize(localizeFormat("__VAR_0__ | Madeira Live Cams", content.title))}/>
        <meta property="og:description" content={localize(content.description)}/>
        <meta property="og:type" content="website"/>
      <meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content={localize(localizeFormat("__VAR_0__ | Madeira Live Cams", content.title))}/><meta name="twitter:description" content={localize(content.description)}/></Head>

      <Layout>
        <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-ocean">{localize("Madeira Live Cams")}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">{localize(content.title)}</h1>

            <div className="mt-5 max-w-3xl space-y-4 text-base leading-7 text-slate-600 sm:text-lg">
              <p>{localize(content.intro)}</p>
              <p>{localize(content.purpose)}</p>
            </div>

            <div id="contact" className="mt-10 border-t border-slate-200 pt-8">
              <div className="rounded-2xl bg-gradient-to-br from-forest to-navy p-6 text-white shadow-lg shadow-forest/20 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">{localize(content.feedback)}</p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{localize(content.idea)}</h2>
                <p className="mt-3 max-w-2xl leading-7 text-white/85">{localize(content.feedbackText)}</p>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center rounded-lg bg-clay px-5 py-3 text-sm font-bold text-navy transition hover:bg-moss">
                  {localize(content.whatsapp)}
                </a>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    </>);
}
export const getStaticProps = translatedStaticProps("/about");
