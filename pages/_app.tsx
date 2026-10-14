import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { defaultLocale, isSupportedLocale, localePath, type Locale } from '../lib/i18n/config';
// @ts-ignore
import '../styles/globals.css';

const SITE_URL = 'https://madeiralivecams.com';
const indexedLocales: Locale[] = ['en', 'uk'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const locale = isSupportedLocale(router.locale) ? router.locale : defaultLocale;
  const localePattern = /^\/(?:en|pt|de|fr|es|pl|uk)(?=\/|$)/;
  const rawPath = router.asPath.split(/[?#]/)[0] || '/';
  const path = rawPath.replace(localePattern, '') || '/';
  const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');
  const canonicalUrl = `${SITE_URL}${localePath(locale, normalizedPath)}`;
  const englishUrl = `${SITE_URL}${localePath('en', normalizedPath)}`;
  const ukrainianUrl = `${SITE_URL}${localePath('uk', normalizedPath)}`;
  const trailBreadcrumbs = normalizedPath === '/trail-availability' ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: locale === 'uk' ? 'Головна' : 'Home', item: `${SITE_URL}${localePath(locale, '/')}` },
      { '@type': 'ListItem', position: 2, name: locale === 'uk' ? 'Завантаженість маршрутів' : 'Trail availability', item: canonicalUrl },
    ],
  } : null;
  const mayIndex = indexedLocales.includes(locale);

  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en" href={englishUrl} />
        <link rel="alternate" hrefLang="uk" href={ukrainianUrl} />
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
