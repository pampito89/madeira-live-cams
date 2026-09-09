import { locations as publicLocations } from './locations';
import { restaurantLocations } from './restaurants';

export { getLocalizedLocation } from './locations';
export type { Location } from './locations';
export const locations = [...publicLocations, ...restaurantLocations];
export function getLocationBySlug(slug: string) {
  return locations.find((location) => location.slug === slug);
}
