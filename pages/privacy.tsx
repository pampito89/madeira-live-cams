import { withStaticTranslations, withServerTranslations, translatedStaticProps } from '../lib/i18n/pageTranslations';
import { useText } from '../lib/i18n/TranslationProvider';
import Head from 'next/head';
import Layout from '../components/Layout';
import { privacyPageText } from '../lib/i18n/privacyPage';
import { useMessages } from '../lib/i18n/useMessages';
export default function PrivacyPage() {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
    const { siteLocale } = useMessages();
    const content = privacyPageText[siteLocale];
    return (<Layout>
      <Head>
        <title>{[localize(content.title), localize(" | Madeira Live Cams")].join("")}</title>
        <meta name="description" content={localize(content.description)}/>
        <meta property="og:title" content={localize(localizeFormat("__VAR_0__ | Madeira Live Cams", content.title))}/>
        <meta property="og:description" content={localize(content.description)}/>
        <meta property="og:type" content="website"/>
      <meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content={localize(localizeFormat("__VAR_0__ | Madeira Live Cams", content.title))}/><meta name="twitter:description" content={localize(content.description)}/></Head>

      <main className="page-shell">
        <section className="mb-6 rounded-2xl bg-gradient-to-br from-forest via-ocean to-leaf px-5 py-8 text-white shadow-lg shadow-forest/15 sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">{localize("Madeira Live Cams")}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{localize(content.title)}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">{localize(content.lastUpdated)}</p>
        </section>

        <article className="rounded-2xl border border-moss/50 bg-white p-5 text-sm leading-7 text-slate-700 shadow-sm sm:p-8 sm:text-base">
          {localize(content.sections.map((section, sectionIndex) => (<section key={section.heading} className={sectionIndex === 0 ? '' : 'mt-7'}>
              <h2 className="text-xl font-bold text-navy">{localize(section.heading)}</h2>
              {localize(section.paragraphs.map((paragraph) => (<p key={paragraph} className="mt-3">{localize(paragraph)}</p>)))}
              {localize(section.email && (<p className="mt-3 font-semibold text-ocean">
                  <a href={`mailto:${section.email}`} className="hover:underline">{localize(section.email)}</a>
                </p>))}
            </section>)))}
        </article>
      </main>
    </Layout>);
}
export const getStaticProps = translatedStaticProps("/privacy");
