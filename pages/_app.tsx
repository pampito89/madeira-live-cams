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
      </Head>
      <Component {...pageProps} />
    </>
  );
}
