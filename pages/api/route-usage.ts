import type { NextApiRequest, NextApiResponse } from 'next';
import { Redis } from '@upstash/redis';

type RouteUsageResponse = {
  limit: number;
  used: number;
  remaining: number;
  month: string;
};

const MONTHLY_ROUTE_LIMIT = 9500;

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

function getRedis() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }

  return Redis.fromEnv();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RouteUsageResponse | { error: string }>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');

    return res.status(405).json({
      error: 'Method not allowed.',
    });
  }

  const redis = getRedis();

  if (!redis) {
    return res.status(503).json({
      error: 'Upstash Redis is not configured.',
    });
  }

  try {
    const month = getBillingMonth();
    const usedValue = await redis.get<number>(`google-routes-usage:${month}`);
    const used = Math.max(0, Number(usedValue ?? 0));

    return res.status(200).json({
      limit: MONTHLY_ROUTE_LIMIT,
      used,
      remaining: Math.max(0, MONTHLY_ROUTE_LIMIT - used),
      month,
    });
  } catch (error) {
    console.error('Route usage request failed:', error);

    return res.status(503).json({
      error: 'Unable to retrieve Google Routes usage.',
    });
  }
}