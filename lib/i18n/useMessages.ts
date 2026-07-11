import { useRouter } from 'next/router';
import { enMessages } from './en';
import { ukMessages } from './uk';

export type Locale = 'en' | 'uk';

export function useMessages() {
  const { locale } = useRouter();

  const currentLocale: Locale = locale === 'uk' ? 'uk' : 'en';

  return {
    locale: currentLocale,
    messages: currentLocale === 'uk' ? ukMessages : enMessages,
  };
}