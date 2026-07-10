import type { AppProps } from 'next/app';
// @ts-ignore: Allow importing global CSS without type declarations
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}