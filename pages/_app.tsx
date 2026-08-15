import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
// @ts-ignore
import '../styles/globals.css';

const SITE_URL = 'https://madeiralivecams.com';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const pathname = router.asPath.split('?')[0];
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  const canonicalUrl = `${SITE_URL}${normalizedPath}`;

  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index,follow" />
        <meta property="og:site_name" content="Madeira Live Cams" />
      </Head>

      <Component {...pageProps} />
    </>
  );
}