import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { defaultLocale, isSupportedLocale, localePath, supportedLocales, type Locale } from '../lib/i18n/config';
// @ts-ignore
import '../styles/globals.css';

const SITE_URL = 'https://madeiralivecams.com';
const fullyIndexedLocales: Locale[] = ['en', 'uk'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const locale = isSupportedLocale(router.locale) ? router.locale : defaultLocale;
  const localePattern = /^\/(?:en|pt|de|fr|es|pl|uk)(?=\/|$)/;
  const rawPath = router.asPath.split(/[?#]/)[0] || '/';
  const path = rawPath.replace(localePattern, '') || '/';
  const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');
  const canonicalUrl = `${SITE_URL}${localePath(locale, normalizedPath)}`;
  const englishUrl = `${SITE_URL}${localePath('en', normalizedPath)}`;
  const multilingualReady = normalizedPath === '/'
    || normalizedPath === '/weather-guide'
    || /^\/cameras\/[^/]+$/.test(normalizedPath);
  const alternateLocales = multilingualReady ? supportedLocales : fullyIndexedLocales;
  const mayIndex = multilingualReady || fullyIndexedLocales.includes(locale);
  const trailBreadcrumbs = normalizedPath === '/trail-availability' ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'uk' ? 'Головна' : 'Home', item: `${SITE_URL}${localePath(locale, '/')}` },
      { '@type': 'ListItem', position: 2, name: locale === 'uk' ? 'Завантаженість маршрутів' : 'Trail availability', item: canonicalUrl },
    ],
  } : null;

  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl} />
        {alternateLocales.map((alternateLocale) => (
          <link key={alternateLocale} rel="alternate" hrefLang={alternateLocale} href={`${SITE_URL}${localePath(alternateLocale, normalizedPath)}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={englishUrl} />
        <meta name="robots" content={mayIndex ? 'index,follow' : 'noindex,follow'} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Madeira Live Cams" />
        {trailBreadcrumbs && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(trailBreadcrumbs).replace(/</g, '\\u003c') }} />}
      </Head>
      <Component {...pageProps} />
    </>
  );
}
