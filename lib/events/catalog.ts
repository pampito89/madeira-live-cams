import titles from '../../data/event-title-translations.json';
import venues from '../../data/event-venue-translations.json';
import type { Locale } from '../i18n/config';

type LocalizedText = Record<Locale, string>;
// Exact normalized titles avoid applying translations to a different event after a title change.
const key = (value: string) => value.normalize('NFC').replace(/\s+/g, ' ').trim();
const titleMap = new Map(Object.entries(titles).map(([source, translations]) => [key(source), translations as LocalizedText]));
const venueMap = new Map(Object.entries(venues).map(([source, translations]) => [key(source), translations as LocalizedText]));
export function catalogTitle(source: string, locale: Locale): string | null {
  return titleMap.get(key(source))?.[locale] || null;
}
export function localizedVenue(source: string, locale: Locale): string {
  return source.split(' · ').map(part => venueMap.get(key(part))?.[locale] || part).join(' · ');
}
