import type { NextApiRequest, NextApiResponse } from 'next';

type ResolvedRoutePoint = { name: string; latitude: number; longitude: number };
type Place = {
  id?: string;
  displayName?: { text?: string };
  googleMapsUri?: string;
  location?: { latitude?: number; longitude?: number };
};

const GOOGLE_HOSTS = new Set([
  'maps.app.goo.gl', 'goo.gl', 'google.com', 'www.google.com', 'maps.google.com',
]);
export const config = { maxDuration: 30 };

class ResolutionError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function coordinates(latitude: number, longitude: number): [number, number] | null {
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    ? [latitude, longitude] : null;
}

function coordinatesFromInput(value: string): [number, number] | null {
  const match = value.match(/^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/);
  return match ? coordinates(Number(match[1]), Number(match[2])) : null;
}

function nameFromUrl(url: URL): string {
  const query = url.searchParams.get('q') || url.searchParams.get('query');
  if (query) return query.trim();
  const place = url.pathname.match(/\/maps\/place\/([^/]+)/i)?.[1] || '';
  try { return decodeURIComponent(place.replace(/\+/g, ' ')).trim(); }
  catch { return ''; }
}

function placeIdFromUrl(url: URL): string {
  const explicit = url.searchParams.get('query_place_id') || url.searchParams.get('place_id');
  const queryId = nameFromUrl(url).match(/^place_id:(.+)$/)?.[1];
  return explicit || queryId || '';
}

function cidFromUrl(url: URL): string {
  const cid = url.searchParams.get('cid');
  if (cid && /^\d{1,20}$/.test(cid)) return BigInt(cid).toString();
  // The second hexadecimal component of ftid identifies the business (CID).
  // Keep it as BigInt: these IDs exceed JavaScript's safe integer range.
  const hex = url.searchParams.get('ftid')?.match(/^0x[\da-f]+:(0x[\da-f]{1,16})$/i)?.[1];
  return hex ? BigInt(hex).toString() : '';
}

function coordinatesFromUrl(url: URL): [number, number] | null {
  const place = url.href.match(/(?:!|%21)3d(-?\d{1,2}(?:\.\d+)?)(?:!|%21)4d(-?\d{1,3}(?:\.\d+)?)/i);
  if (place) return coordinates(Number(place[1]), Number(place[2]));
  const query = coordinatesFromInput(nameFromUrl(url));
  if (query) return query;
  // @lat,lng is the viewport centre, not necessarily the selected business.
  if (nameFromUrl(url) || placeIdFromUrl(url) || url.searchParams.has('ftid') || url.searchParams.has('cid')) return null;
  const centre = url.pathname.match(/@(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/);
  return centre ? coordinates(Number(centre[1]), Number(centre[2])) : null;
}

function validateGoogleUrl(url: URL) {
  if (url.protocol !== 'https:' || !GOOGLE_HOSTS.has(url.hostname)
    || url.username || url.password || (url.port && url.port !== '443')) {
    throw new ResolutionError(400, 'Use a Google Maps link.');
  }
}

async function expandGoogleUrl(url: URL, signal: AbortSignal): Promise<URL> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    validateGoogleUrl(url);
    if (coordinatesFromUrl(url) || nameFromUrl(url) || placeIdFromUrl(url)) return url;
    const response = await fetch(url.toString(), {
      redirect: 'manual', signal,
      headers: { 'User-Agent': 'MadeiraLiveCams/1.0' },
    });
    const location = response.headers.get('location');
    await response.body?.cancel();
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url);
    } else {
      throw new ResolutionError(422, 'This link does not identify a place. Share the place from Google Maps, or enter its coordinates.');
    }
  }
  throw new ResolutionError(422, 'The Google Maps link has too many redirects.');
}

async function findPlace(url: URL, signal: AbortSignal): Promise<ResolvedRoutePoint | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new ResolutionError(503, 'Place lookup is temporarily unavailable. You can enter coordinates instead.');
  const query = nameFromUrl(url);
  const placeId = placeIdFromUrl(url);
  const cid = cidFromUrl(url);
  const fields = 'id,displayName,location,googleMapsUri';
  const response = await fetch(placeId
    ? `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`
    : 'https://places.googleapis.com/v1/places:searchText', {
    method: placeId ? 'GET' : 'POST', signal, redirect: 'error',
    headers: {
      'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': placeId ? fields : fields.split(',').map((field) => `places.${field}`).join(','),
    },
    ...(placeId ? {} : { body: JSON.stringify({ textQuery: query, pageSize: cid ? 20 : 2 }) }),
  });
  if (response.status === 401 || response.status === 403) {
    throw new ResolutionError(503, 'Place lookup is temporarily unavailable. You can enter coordinates instead.');
  }
  if (!response.ok) throw new ResolutionError(502, 'Google could not look up this place. Please try again.');
  const data = await response.json() as Place & { places?: Place[] };
  const places = placeId ? [data] : data.places || [];
  // Match the shared business, rather than accepting the first search result.
  const matches = cid ? places.filter((place) => {
    try { return Boolean(place.googleMapsUri) && cidFromUrl(new URL(place.googleMapsUri!)) === cid; }
    catch { return false; }
  }) : places;
  if (matches.length > 1) throw new ResolutionError(422, 'More than one place was found. Enter the full address or exact coordinates.');
  const place = matches[0];
  const point = coordinates(Number(place?.location?.latitude ?? NaN), Number(place?.location?.longitude ?? NaN));
  return point ? { name: place.displayName?.text || query.split(',')[0] || 'Google Maps location', latitude: point[0], longitude: point[1] } : null;
}

async function findAddress(query: string, signal: AbortSignal): Promise<ResolvedRoutePoint | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '2');
  const response = await fetch(url, { signal, redirect: 'error', headers: { 'User-Agent': 'MadeiraLiveCams/1.0 (contact@madeiralivecams.com)' } });
  if (!response.ok) return null;
  const results = await response.json() as Array<{ lat?: string; lon?: string }>;
  if (results.length !== 1) return null;
  const point = coordinates(Number(results[0].lat ?? NaN), Number(results[0].lon ?? NaN));
  return point ? { name: query.split(',')[0].trim(), latitude: point[0], longitude: point[1] } : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResolvedRoutePoint | { error: string }>,
) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  const input = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
  if (!input || input.length > 4096) return res.status(400).json({ error: 'Enter a Google Maps link, address, or coordinates.' });
  const direct = coordinatesFromInput(input);
  if (direct) return res.status(200).json({ name: 'Custom point', latitude: direct[0], longitude: direct[1] });
  const signal = AbortSignal.timeout(20000);
  try {
    let url: URL | null = null;
    try { url = new URL(input); } catch { /* Plain address input remains supported. */ }
    if (!url) {
      if (/^(?:https?:|www\.)/i.test(input)) throw new ResolutionError(400, 'Use a valid Google Maps link.');
      const point = await findAddress(input, signal);
      if (point) return res.status(200).json(point);
      throw new ResolutionError(422, 'Address not found. Enter a Google Maps link or exact coordinates.');
    }
    url = await expandGoogleUrl(url, signal);
    const point = coordinatesFromUrl(url);
    if (point) return res.status(200).json({ name: nameFromUrl(url) || 'Google Maps location', latitude: point[0], longitude: point[1] });
    const place = await findPlace(url, signal);
    if (place) return res.status(200).json(place);
    throw new ResolutionError(422, 'Place not found. Enter its full address or exact coordinates.');
  } catch (error) {
    const status = error instanceof ResolutionError ? error.status : signal.aborted ? 504 : 502;
    const message = error instanceof ResolutionError ? error.message : 'Unable to look up this place. Please try again or enter coordinates.';
    return res.status(status).json({ error: message });
  }
}
