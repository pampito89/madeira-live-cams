import { cameras } from '../components/cameraData';
import { locations } from '../data/plannerLocations';
import { locationCoordinates, type LocationCoordinates } from './locationWeather';

export type NearbyItem = {
  href: string;
  name: { en: string; uk: string };
  meta: { en: string; uk: string };
  distanceKm: number;
};

export type NearbyLinksData = {
  cameras: NearbyItem[];
  locations: NearbyItem[];
};

const COORD_PATTERN = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;
const EARTH_RADIUS_KM = 6371;

function parseCoords(mapQuery?: string): LocationCoordinates | null {
  if (!mapQuery) return null;
  const match = COORD_PATTERN.exec(mapQuery);
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

function getLocationCoords(slug: string, mapQuery?: string): LocationCoordinates | null {
  return locationCoordinates[slug] ?? parseCoords(mapQuery);
}

function haversineKm(a: LocationCoordinates, b: LocationCoordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return Math.round(2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h))) * 10) / 10;
}

const publicExploreLocations = locations
  .filter(location => !location.hiddenFromExplore && !location.tags.includes('Villas'))
  .map(location => ({
    slug: location.slug,
    name: location.name,
    meta: location.area,
    coords: getLocationCoords(location.slug, location.mapQuery),
  }))
  .filter((item): item is { slug: string; name: { en: string; uk: string }; meta: { en: string; uk: string }; coords: LocationCoordinates } => item.coords !== null);

function nearestCameras(origin: LocationCoordinates, excludeId: string | null, limit: number): NearbyItem[] {
  return cameras
    .filter(camera => camera.id !== excludeId)
    .map(camera => ({
      href: `/cameras/${camera.id}`,
      name: camera.name,
      meta: camera.region,
      distanceKm: haversineKm(origin, { latitude: camera.latitude, longitude: camera.longitude }),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm || a.href.localeCompare(b.href))
    .slice(0, limit);
}

function nearestLocations(origin: LocationCoordinates, excludeSlug: string | null, limit: number): NearbyItem[] {
  return publicExploreLocations
    .filter(location => location.slug !== excludeSlug)
    .map(location => ({
      href: `/explore/${location.slug}`,
      name: location.name,
      meta: location.meta,
      distanceKm: haversineKm(origin, location.coords),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm || a.href.localeCompare(b.href))
    .slice(0, limit);
}

export function getNearbyForCamera(cameraId: string): NearbyLinksData {
  const camera = cameras.find(item => item.id === cameraId);
  if (!camera) return { cameras: [], locations: [] };
  const origin = { latitude: camera.latitude, longitude: camera.longitude };
  return {
    locations: nearestLocations(origin, null, 4),
    cameras: nearestCameras(origin, camera.id, 3),
  };
}

export function getNearbyForLocation(
  slug: string,
  fallbackCoords?: LocationCoordinates | null,
  mapQuery?: string,
): NearbyLinksData {
  const origin = fallbackCoords ?? getLocationCoords(slug, mapQuery);
  if (!origin) return { cameras: [], locations: [] };
  return {
    cameras: nearestCameras(origin, null, 2),
    locations: nearestLocations(origin, slug, 4),
  };
}

export function getNearbyForStay(origin: LocationCoordinates): NearbyLinksData {
  return {
    cameras: nearestCameras(origin, null, 2),
    locations: nearestLocations(origin, null, 4),
  };
}
