import { supportedLocales, type Locale } from './config';

/** Only authored language editions should be indexed. */
export function indexableLocales(path: string): readonly Locale[] {
  if (isPrivateOrUtilityPath(path)) return [];
  if (path === '/news' || path.startsWith('/news/')) return ['en'];
  return path === '/car-rental' ? ['uk'] : supportedLocales;
}
export function defaultPageLocale(path: string): Locale {
  return path === '/car-rental' ? 'uk' : 'en';
}
export function isPrivateOrUtilityPath(path: string): boolean {
  return path === '/trail-booking-iphone' || /^\/(?:404|500|_error|guide|admin)(?:\/|$)/.test(path);
}
