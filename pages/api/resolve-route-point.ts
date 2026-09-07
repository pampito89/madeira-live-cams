import type { NextApiRequest, NextApiResponse } from 'next';

type ResolvedRoutePoint = {
  name: string;
  latitude: number;
  longitude: number;
};

const GOOGLE_HOSTS = new Set([
  'maps.app.goo.gl',
  'goo.gl',
  'google.com',
  'www.google.com',
  'maps.google.com',
]);

function coordinatesFromUrl(value: URL): [number, number] | null {
  const fromAt = value.href.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
  const fromQuery = value.searchParams.get('q')?.match(/(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/);
  const match = fromAt ?? fromQuery;

  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
    ? [latitude, longitude]
    : null;
}

function nameFromUrl(value: URL) {
  const placeMatch = value.pathname.match(/\/maps\/place\/([^/@]+)/i);
  const queryName = value.searchParams.get('q') || value.searchParams.get('query');
  const rawName = placeMatch?.[1] || queryName || '';

  try {
    return decodeURIComponent(rawName.replace(/\+/g, ' ')).trim();
  } catch {
    return rawName.replace(/\+/g, ' ').trim();
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResolvedRoutePoint | { error: string }>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const sharedUrl = typeof req.body?.url === 'string' ? req.body.url.trim() : '';

  let currentUrl: URL;
  try {
    currentUrl = new URL(sharedUrl);
  } catch {
    return res.status(400).json({ error: 'Enter a valid Google Maps link.' });
  }

  if (currentUrl.protocol !== 'https:' || !GOOGLE_HOSTS.has(currentUrl.hostname)) {
    return res.status(400).json({ error: 'Use a Google Maps link.' });
  }

  try {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await fetch(currentUrl.toString(), {
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MadeiraLiveCams/1.0)' },
      });
      const location = response.headers.get('location');
      if (!location || response.status < 300 || response.status >= 400) break;
      currentUrl = new URL(location, currentUrl);
    }

    if (!GOOGLE_HOSTS.has(currentUrl.hostname)) {
      return res.status(400).json({ error: 'The Google Maps link could not be resolved.' });
    }

    const coordinates = coordinatesFromUrl(currentUrl);
    if (!coordinates) {
      return res.status(422).json({ error: 'Coordinates were not found in this Google Maps link.' });
    }

    return res.status(200).json({
      name: nameFromUrl(currentUrl) || 'Google Maps location',
      latitude: coordinates[0],
      longitude: coordinates[1],
    });
  } catch {
    return res.status(502).json({ error: 'Unable to resolve this Google Maps link.' });
  }
}
