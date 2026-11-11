import { supportedLocales, type Locale } from './config';
/** Public language editions have their own canonical URLs. */
export function indexableLocales(path: string): readonly Locale[] {
  if (isPrivateOrUtilityPath(path)) return [];
  return path === '/car-rental' ? ['uk'] : supportedLocales;
}
export function defaultPageLocale(path: string): Locale {
  return path === '/car-rental' ? 'uk' : 'en';
}
export function isPrivateOrUtilityPath(path: string): boolean {
  return path === '/trail-booking-iphone' || /^\/(?:404|500|_error|guide|admin)(?:\/|$)/.test(path);
}
