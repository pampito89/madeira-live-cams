import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
// @ts-ignore
import '../styles/globals.css';

const SITE_URL = 'https://madeiralivecams.com';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const rawPath = router.asPath.split(/[?#]/)[0] || '/';
  const path = rawPath.replace(/^\/(?:en|uk)(?=\/|$)/, '') || '/';
  const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');
  const englishUrl = `${SITE_URL}${normalizedPath}`;
  const ukrainianUrl = `${SITE_URL}/uk${normalizedPath === '/' ? '' : normalizedPath}`;
  const canonicalUrl = router.locale === 'uk' ? ukrainianUrl : englishUrl;
  const trailBreadcrumbs = normalizedPath === '/trail-availability' ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: router.locale === 'uk' ? 'Головна' : 'Home', item: `${SITE_URL}${router.locale === 'uk' ? '/uk' : '/'}` },
      { '@type': 'ListItem', position: 2, name: router.locale === 'uk' ? 'Завантаженість маршрутів' : 'Trail availability', item: canonicalUrl },
    ],
  } : null;

  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en" href={englishUrl} />
        <link rel="alternate" hrefLang="uk" href={ukrainianUrl} />
        <link rel="alternate" hrefLang="x-default" href={englishUrl} />
        <meta name="robots" content="index,follow" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Madeira Live Cams" />
        {trailBreadcrumbs && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(trailBreadcrumbs).replace(/</g, '\\u003c') }} />}
      </Head>
      <Component {...pageProps} />
    </>
  );
}
