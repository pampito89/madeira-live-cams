import Head from 'next/head';
import Layout from '../components/Layout';
import { privacyPageText } from '../lib/i18n/privacyPage';
import { useMessages } from '../lib/i18n/useMessages';

export default function PrivacyPage() {
  const { siteLocale } = useMessages();
  const content = privacyPageText[siteLocale];

  return (
    <Layout>
      <Head>
        <title>{content.title} | Madeira Live Cams</title>
        <meta name="description" content={content.description} />
        <meta property="og:title" content={`${content.title} | Madeira Live Cams`} />
        <meta property="og:description" content={content.description} />
        <meta property="og:type" content="website" />
      </Head>

      <main className="page-shell">
        <section className="mb-6 rounded-2xl bg-gradient-to-br from-forest via-ocean to-leaf px-5 py-8 text-white shadow-lg shadow-forest/15 sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">Madeira Live Cams</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{content.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">{content.lastUpdated}</p>
        </section>

        <article className="rounded-2xl border border-moss/50 bg-white p-5 text-sm leading-7 text-slate-700 shadow-sm sm:p-8 sm:text-base">
          {content.sections.map((section, sectionIndex) => (
            <section key={section.heading} className={sectionIndex === 0 ? '' : 'mt-7'}>
              <h2 className="text-xl font-bold text-navy">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3">{paragraph}</p>
              ))}
              {section.email && (
                <p className="mt-3 font-semibold text-ocean">
                  <a href={`mailto:${section.email}`} className="hover:underline">{section.email}</a>
                </p>
              )}
            </section>
          ))}
        </article>
      </main>
    </Layout>
  );
}
