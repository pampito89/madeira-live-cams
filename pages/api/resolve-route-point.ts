import type { NextApiRequest, NextApiResponse } from 'next';

type SuccessResponse = {
  latitude: number;
  longitude: number;
  name: string | null;
};

type ErrorResponse = { error: string };

const GOOGLE_HOSTS = new Set([
  'goo.gl',
  'g.co',
  'maps.app.goo.gl',
  'maps.google.com',
  'www.google.com',
  'google.com',
]);

function isAllowedGoogleUrl(url: URL) {
  return GOOGLE_HOSTS.has(url.hostname.toLowerCase());
}

function coordinatesFromText(value: string): [number, number] | null {
  const patterns = [
    /@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/,
    /[?&](?:q|query|ll)=(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/,
    /!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);

    if (!match) continue;

    const latitude = Number(match[1]);
    const longitude = Number(match[2]);

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    ) {
      return [latitude, longitude];
    }
  }

  return null;
}

function nameFromGoogleUrl(url: URL): string | null {
  const queryName = url.searchParams.get('query') ?? url.searchParams.get('q');

  if (queryName && !coordinatesFromText(queryName)) {
    return queryName.replaceAll('+', ' ').trim() || null;
  }

  const placeMatch = decodeURIComponent(url.pathname).match(/\/place\/([^/]+)/);

  return placeMatch?.[1].replaceAll('+', ' ').trim() || null;
}

async function resolveGoogleMapsUrl(input: string) {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    throw new Error('Enter a Google Maps link or coordinates.');
  }

  if (!isAllowedGoogleUrl(url)) {
    throw new Error('Only Google Maps links are supported.');
  }

  for (let redirect = 0; redirect < 6; redirect += 1) {
    const coordinates = coordinatesFromText(url.toString());

    if (coordinates) {
      return { coordinates, name: nameFromGoogleUrl(url) };
    }

    const response = await fetch(url.toString(), {
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
    });
    const location = response.headers.get('location');

    if (!location || response.status < 300 || response.status >= 400) {
      break;
    }

    url = new URL(location, url);

    if (!isAllowedGoogleUrl(url)) {
      throw new Error('The Google Maps link redirected to an unsupported address.');
    }
  }

  const coordinates = coordinatesFromText(url.toString());

  if (!coordinates) {
    throw new Error('Coordinates could not be read from this Google Maps link.');
  }

  return { coordinates, name: nameFromGoogleUrl(url) };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const value = typeof req.body?.value === 'string' ? req.body.value.trim() : '';
  const directCoordinates = coordinatesFromText(value);

  if (directCoordinates) {
    return res.status(200).json({
      latitude: directCoordinates[0],
      longitude: directCoordinates[1],
      name: null,
    });
  }

  try {
    const result = await resolveGoogleMapsUrl(value);

    return res.status(200).json({
      latitude: result.coordinates[0],
      longitude: result.coordinates[1],
      name: result.name,
    });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Unable to resolve this route point.',
    });
  }
}
