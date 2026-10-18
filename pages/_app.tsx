import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { defaultLocale, isSupportedLocale, localePath } from '../lib/i18n/config';
import { indexableLocales, isPrivateOrUtilityPath } from '../lib/i18n/coverage';
import { TranslationProvider } from '../lib/i18n/TranslationProvider';
import '../styles/globals.css';
const SITE_URL = 'https://madeiralivecams.com';
const EMPTY_CATALOG = {};
const breadcrumbLabels = {
  en: ['Home', 'Trail availability'],
  pt: ['Início', 'Disponibilidade dos percursos'],
  de: ['Startseite', 'Verfügbarkeit der Wanderwege'],
  fr: ['Accueil', 'Disponibilité des sentiers'],
  es: ['Inicio', 'Disponibilidad de los senderos'],
  pl: ['Strona główna', 'Dostępność szlaków'],
  uk: ['Головна', 'Завантаженість маршрутів'],
};
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const locale = isSupportedLocale(router.locale) ? router.locale : defaultLocale;
  const rawPath = router.asPath.split(/[?#]/)[0] || '/';
  const path = rawPath.replace(/^\/(?:en|pt|de|fr|es|pl|uk)(?=\/|$)/, '') || '/';
  const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');
  const canonicalUrl = `${SITE_URL}${localePath(locale, normalizedPath)}`;
  const alternates = indexableLocales(normalizedPath);
  const privateOrUtility = isPrivateOrUtilityPath(normalizedPath) || ['/404', '/500', '/_error'].includes(router.pathname);
  const noindex = privateOrUtility || !alternates.includes(locale);
  const trailBreadcrumbs = normalizedPath === '/trail-availability' && !noindex ? {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: breadcrumbLabels[locale][0], item: `${SITE_URL}${localePath(locale, '/')}` },
      { '@type': 'ListItem', position: 2, name: breadcrumbLabels[locale][1], item: canonicalUrl },
    ],
  } : null;
  return <TranslationProvider catalog={pageProps.translationCatalog ?? EMPTY_CATALOG}>
    <Head>
      <link rel="canonical" href={canonicalUrl} />
      {!privateOrUtility && alternates.map(alternateLocale => <link key={alternateLocale} rel="alternate" hrefLang={alternateLocale} href={`${SITE_URL}${localePath(alternateLocale, normalizedPath)}`} />)}
      {!privateOrUtility && <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${localePath('en', normalizedPath)}`} />}
      <meta name="robots" content={noindex ? 'noindex,follow' : 'index,follow'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Madeira Live Cams" />
      {trailBreadcrumbs && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(trailBreadcrumbs).replace(/</g, '\\u003c') }} />}
    </Head>
    <Component {...pageProps} />
  </TranslationProvider>;
}
