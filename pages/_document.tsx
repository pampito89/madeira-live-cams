import NextDocument, {
  Head,
  Html,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from 'next/document';
import { defaultLocale, isSupportedLocale, localeDetails } from '../lib/i18n/config';

type Props = DocumentInitialProps & { documentLocale: string };

export default class Document extends NextDocument<Props> {
  static async getInitialProps(ctx: DocumentContext): Promise<Props> {
    const initialProps = await NextDocument.getInitialProps(ctx);
    const locale = isSupportedLocale(ctx.locale) ? ctx.locale : defaultLocale;
    return { ...initialProps, documentLocale: localeDetails[locale].htmlLang };
  }

  render() {
    return (
      <Html lang={this.props.documentLocale}>
        <Head>
          <meta name="application-name" content="Madeira Live Cams" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Madeira Live Cams" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#0f766e" />
          <link rel="manifest" href="/manifest.webmanifest" />
          <link rel="apple-touch-icon" href="/icon-192.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
