import { useRouter } from 'next/router';
import { enMessages } from './en';
import { ukMessages } from './uk';
import { deMessages, esMessages, frMessages, plMessages, ptMessages } from './additional';
import { defaultLocale, isSupportedLocale, type Locale } from './config';

export type { Locale } from './config';
export type ContentLocale = 'en' | 'uk';

const messagesByLocale = {
  en: enMessages,
  pt: ptMessages,
  de: deMessages,
  fr: frMessages,
  es: esMessages,
  pl: plMessages,
  uk: ukMessages,
};

export function useMessages() {
  const { locale } = useRouter();
  const siteLocale: Locale = isSupportedLocale(locale) ? locale : defaultLocale;
  const contentLocale: ContentLocale = siteLocale === 'uk' ? 'uk' : 'en';

  return {
    locale: contentLocale,
    siteLocale,
    messages: messagesByLocale[siteLocale],
  };
}
