import { supportedLocales, type Locale } from './config';

/** Public editorial content is available in every supported language. */
export function indexableLocales(path: string): readonly Locale[] {
  return isPrivateOrUtilityPath(path) ? [] : supportedLocales;
}

export function isPrivateOrUtilityPath(path: string): boolean {
  return path === '/trail-booking-iphone' || /^\/(?:404|500|_error|guide|admin)(?:\/|$)/.test(path);
}
