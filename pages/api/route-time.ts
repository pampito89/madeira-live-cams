import type { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type RouteUsage = {
  limit: number;
  used: number;
  remaining: number;
  month: string;
};

type RouteTimeResponse = {
  durationMinutes: number;
  usage: RouteUsage;
};

type ErrorResponse = {
  error: string;
  usage?: RouteUsage;
};

const MONTHLY_ROUTE_LIMIT = 9500;

function isCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const coordinates = value as Coordinates;

  return (
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}

function getBillingMonth() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;

  return `${year}-${month}`;
}

function getUsageKey(month: string) {
  return `google-routes-usage:${month}`;
}

function getRedis() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }

  return Redis.fromEnv();
}

function parseGoogleDurationToMinutes(
  duration: string | undefined,
): number | null {
  if (!duration) {
    return null;
  }

  const seconds = Number.parseFloat(duration.replace('s', ''));

  if (!Number.isFinite(seconds) || seconds < 0) {
    return null;
  }

  return Math.max(1, Math.round(seconds / 60));
}

async function reserveRouteRequest() {
  const redis = getRedis();

  if (!redis) {
    throw new Error('Upstash Redis is not configured.');
  }

  const month = getBillingMonth();
  const key = getUsageKey(month);

  const usageResult = await redis.eval(
    `
      local current = redis.call('GET', KEYS[1])

      if not current then
        current = 0
      else
        current = tonumber(current)
      end

      if current >= tonumber(ARGV[1]) then
        return -1
      end

      return redis.call('INCR', KEYS[1])
    `,
    [key],
    [String(MONTHLY_ROUTE_LIMIT)],
  );

  const used = Number(usageResult);

  if (!Number.isFinite(used)) {
    throw new Error('Upstash Redis returned an invalid usage value.');
  }

  if (used === -1) {
    return {
      allowed: false,
      usage: {
        limit: MONTHLY_ROUTE_LIMIT,
        used: MONTHLY_ROUTE_LIMIT,
        remaining: 0,
        month,
      },
    };
  }

  return {
    allowed: true,
    usage: {
      limit: MONTHLY_ROUTE_LIMIT,
      used,
      remaining: Math.max(0, MONTHLY_ROUTE_LIMIT - used),
      month,
    },
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RouteTimeResponse | ErrorResponse>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');

    return res.status(405).json({
      error: 'Method not allowed.',
    });
  }

  const { origin, destination } = req.body ?? {};

  if (!isCoordinates(origin) || !isCoordinates(destination)) {
    return res.status(400).json({
      error: 'Valid origin and destination coordinates are required.',
    });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'GOOGLE_MAPS_API_KEY is not configured.',
    });
  }

  let reservation: Awaited<ReturnType<typeof reserveRouteRequest>>;

  try {
    reservation = await reserveRouteRequest();
  } catch (error) {
    console.error('Google Routes usage counter failed:', error);

    return res.status(503).json({
      error: 'Google Routes usage counter is unavailable.',
    });
  }

  if (!reservation.allowed) {
    return res.status(429).json({
      error: 'The monthly Google Routes limit has been reached.',
      usage: reservation.usage,
    });
  }

  try {
    const response = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
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
      },
    );

    if (!response.ok) {
      const googleError = await response.text();

      console.error(
        'Google Routes API error:',
        response.status,
        googleError,
      );

      return res.status(502).json({
        error: 'Google Routes API could not calculate this journey.',
        usage: reservation.usage,
      });
    }

    const data = (await response.json()) as {
      routes?: Array<{
        duration?: string;
      }>;
    };

    const durationMinutes = parseGoogleDurationToMinutes(
      data.routes?.[0]?.duration,
    );

    if (durationMinutes === null) {
      return res.status(502).json({
        error: 'Google Routes API returned no route duration.',
        usage: reservation.usage,
      });
    }

    return res.status(200).json({
      durationMinutes,
      usage: reservation.usage,
    });
  } catch (error) {
    console.error('Route-time request failed:', error);

    return res.status(500).json({
      error: 'Unable to calculate route time.',
      usage: reservation.usage,
    });
  }
}