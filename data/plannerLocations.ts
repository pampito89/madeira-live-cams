import { locations as publicLocations, type Location } from './locations';
import { restaurantLocations } from './restaurants';
import { stays } from './stays';

export { getLocalizedLocation } from './locations';
export type { Location } from './locations';
export const villaLocations: Location[] = stays.map(stay => ({
  slug: stay.slug,
  name: { en: stay.name, uk: stay.name },
  area: { en: 'Madeira', uk: 'Madeira' },
  category: { en: 'Villa', uk: 'Вілла' },
  tags: ['Villas'],
  hiddenFromExplore: true,
  summary: stay.shortDescription,
  image: '/images/cameras/madeira-camera-2.png',
  imageAlt: { en: 'Madeira map', uk: 'Карта Мадейри' },
  mapQuery: `${stay.latitude},${stay.longitude}`,
  article: { intro: stay.shortDescription, history: stay.shortDescription, highlights: { en: [], uk: [] }, practicalTip: { en: 'Adjust the stop duration to your plans.', uk: 'Налаштуйте тривалість зупинки відповідно до ваших планів.' } },
}));
export const locations = [...publicLocations, ...restaurantLocations, ...villaLocations];
export function getLocationBySlug(slug: string) {
  return locations.find(location => location.slug === slug);
}
export function plannerLocationPath(location: { slug: string; tags: string[] }) {
  return `${location.tags.includes('Villas') ? '/stays/' : '/explore/'}${location.slug}`;
}
