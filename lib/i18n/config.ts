export const supportedLocales = ['en', 'pt', 'de', 'fr', 'es', 'pl', 'uk'] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = 'en';

export const localeDetails: Record<Locale, {
  code: string;
  name: string;
  flag: string;
  htmlLang: string;
}> = {
  en: { code: 'EN', name: 'English', flag: '🇬🇧', htmlLang: 'en' },
  pt: { code: 'PT', name: 'Português', flag: '🇵🇹', htmlLang: 'pt-PT' },
  de: { code: 'DE', name: 'Deutsch', flag: '🇩🇪', htmlLang: 'de' },
  fr: { code: 'FR', name: 'Français', flag: '🇫🇷', htmlLang: 'fr' },
  es: { code: 'ES', name: 'Español', flag: '🇪🇸', htmlLang: 'es' },
  pl: { code: 'PL', name: 'Polski', flag: '🇵🇱', htmlLang: 'pl' },
  uk: { code: 'UK', name: 'Українська', flag: '🇺🇦', htmlLang: 'uk' },
};

export function isSupportedLocale(value: string | undefined): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function localePath(locale: Locale, path: string) {
  const normalizedPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return locale === defaultLocale ? normalizedPath || '/' : `/${locale}${normalizedPath}`;
}
