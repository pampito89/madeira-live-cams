import type { NextApiRequest, NextApiResponse } from 'next';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type RouteTimeResponse = {
  durationMinutes: number;
};

function isCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== 'object') return false;
  const coordinates = value as Coordinates;
  return Number.isFinite(coordinates.latitude) && Number.isFinite(coordinates.longitude);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RouteTimeResponse | { error: string }>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { origin, destination } = req.body ?? {};

  if (!isCoordinates(origin) || !isCoordinates(destination)) {
    return res.status(400).json({ error: 'Valid origin and destination coordinates are required.' });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY is not configured.' });
  }

  try {
    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.duration',
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: origin.latitude,
              longitude: origin.longitude,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.latitude,
              longitude: destination.longitude,
            },
          },
        },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_UNAWARE',
        units: 'METRIC',
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      console.error('Google Routes API error:', response.status, message);
      return res.status(502).json({ error: 'Google Routes API could not calculate this journey.' });
    }

    const data = await response.json() as { routes?: Array<{ duration?: string }> };
    const duration = data.routes?.[0]?.duration;
    const seconds = duration ? Number.parseFloat(duration.replace('s', '')) : NaN;

    if (!Number.isFinite(seconds) || seconds < 0) {
      return res.status(502).json({ error: 'Google Routes API returned no route duration.' });
    }

    return res.status(200).json({ durationMinutes: Math.max(1, Math.round(seconds / 60)) });
  } catch (error) {
    console.error('Route-time request failed:', error);
    return res.status(500).json({ error: 'Unable to calculate route time.' });
  }
}
