import { useNavigationMemory } from '../lib/useNavigationMemory';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { defaultLocale, isSupportedLocale, localePath } from '../lib/i18n/config';
import { defaultPageLocale, indexableLocales, isPrivateOrUtilityPath } from '../lib/i18n/coverage';
import { TranslationProvider } from '../lib/i18n/TranslationProvider';
import '../styles/globals.css';
const SITE_URL = 'https://madeiralivecams.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/pico-radar-desktop.png`;
const EMPTY_CATALOG = {};
const ogLocales = {
    en: 'en_GB',
    pt: 'pt_PT',
    de: 'de_DE',
    fr: 'fr_FR',
    es: 'es_ES',
    pl: 'pl_PL',
    uk: 'uk_UA',
} as const;
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
    useNavigationMemory();
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
      <link key="canonical" rel="canonical" href={canonicalUrl}/>
      {!privateOrUtility && alternates.map(alternateLocale => <link key={`hreflang-${alternateLocale}`} rel="alternate" hrefLang={alternateLocale} href={`${SITE_URL}${localePath(alternateLocale, normalizedPath)}`}/>)}
      {!privateOrUtility && <link key="hreflang-x-default" rel="alternate" hrefLang="x-default" href={`${SITE_URL}${localePath(defaultPageLocale(normalizedPath), normalizedPath)}`}/>}
      <meta name="robots" content={noindex ? 'noindex,follow' : 'index,follow'}/>
      <meta key="og:url" property="og:url" content={canonicalUrl}/>
      <meta key="og:site_name" property="og:site_name" content="Madeira Live Cams"/>
      <meta key="og:locale" property="og:locale" content={ogLocales[locale]}/>
      <meta key="og:image" property="og:image" content={DEFAULT_OG_IMAGE}/>
      <meta key="og:image:alt" property="og:image:alt" content="Madeira Live Cams"/>
      <meta key="twitter:image" name="twitter:image" content={DEFAULT_OG_IMAGE}/>
      {trailBreadcrumbs && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(trailBreadcrumbs).replace(/</g, '\\u003c') }}/>}
    </Head>
    <Component {...pageProps}/>
  </TranslationProvider>;
}
