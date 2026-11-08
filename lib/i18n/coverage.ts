import { supportedLocales, type Locale } from './config';

const isNews = (path: string) => path === '/news' || path.startsWith('/news/');
/** Only authored language editions should be indexed. */
export function indexableLocales(path: string): readonly Locale[] {
  if (isPrivateOrUtilityPath(path)) return [];
  return path === '/car-rental' || isNews(path) ? ['uk'] : supportedLocales;
}
export function defaultPageLocale(path: string): Locale {
  return path === '/car-rental' || isNews(path) ? 'uk' : 'en';
}
export function isPrivateOrUtilityPath(path: string): boolean {
  return path === '/trail-booking-iphone' || /^\/(?:404|500|_error|guide|admin)(?:\/|$)/.test(path);
}
