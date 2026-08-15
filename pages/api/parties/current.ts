import type { NextApiRequest, NextApiResponse } from 'next';

type EventData = {
  name: string;
  description: string;
  startDate: string | null;
  venue: string | null;
  address: string | null;
  image: string | null;
  eventUrl: string;
};

const ACCOUNT = 'thepurplefridays';
const INSTAGRAM_URL = `https://www.instagram.com/${ACCOUNT}/`;

const text = (value: unknown) =>
  typeof value === 'string'
    ? value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

const firstUrl = (value: string) =>
  value.match(/https?:\/\/[^\s]+/i)?.[0] || '';

function cleanUrl(value: string) {
  try {
    const url = new URL(value);
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return value;
  }
}

function eventFromHtml(
  html: string,
  fallbackUrl: string,
  fallbackDescription: string,
): EventData | null {
  const blocks =
    html.match(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
    ) || [];

  for (const block of blocks) {
    try {
      const json = block
        .replace(/^<script[^>]*>[\s\S]*?>/i, '')
        .replace(/<\/script>$/i, '');

      const parsed = JSON.parse(json);

      const items = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed['@graph'])
          ? parsed['@graph']
          : [parsed];

      const event = items.find(
        (item: any) =>
          item?.['@type'] === 'Event' ||
          item?.['@type']?.includes?.('Event'),
      );

      if (!event) {
        continue;
      }

      const address = event.location?.address;

      const addressText = [
        address?.streetAddress,
        address?.addressLocality,
        address?.addressRegion,
        address?.addressCountry,
      ]
        .map(text)
        .filter(Boolean)
        .join(', ');

      const image = Array.isArray(event.image)
        ? event.image[0]
        : event.image;

      return {
        name: text(event.name) || 'The Purple Fridays',
        description: text(event.description) || fallbackDescription,
        startDate: text(event.startDate) || null,
        venue: text(event.location?.name) || null,
        address: addressText || null,
        image: text(image) || null,
        eventUrl: cleanUrl(text(event.url) || fallbackUrl),
      };
    } catch {
      continue;
    }
  }

  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');

  try {
    const token = process.env.META_PAGE_ACCESS_TOKEN;
    const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    if (!token || !accountId) {
      throw new Error('Instagram integration is not configured.');
    }

    const fields = `business_discovery.username(${ACCOUNT}){biography,website,profile_picture_url}`;

    const metaUrl = new URL(
      `https://graph.facebook.com/v26.0/${accountId}`,
    );

    metaUrl.searchParams.set('fields', fields);
    metaUrl.searchParams.set('access_token', token);

    const metaResponse = await fetch(metaUrl.toString());

    if (!metaResponse.ok) {
      throw new Error('Instagram could not be reached.');
    }

    const meta = await metaResponse.json();
    const profile = meta.business_discovery;

    const biography = text(profile?.biography);

    const url = cleanUrl(
      profile?.website || firstUrl(profile?.biography || ''),
    );

    if (!url) {
      return res.status(200).json({ event: null });
    }

    let event: EventData | null = null;

    if (url.includes('eventbrite.')) {
      const eventbrite = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; MadeiraLiveCams/1.0)',
        },
      });

      if (eventbrite.ok) {
        event = eventFromHtml(
          await eventbrite.text(),
          url,
          biography,
        );
      }
    }

    return res.status(200).json({
      event: event || {
        name: 'The Purple Fridays',
        description: biography,
        startDate: null,
        venue: null,
        address: null,
        image: profile?.profile_picture_url || null,
        eventUrl: url,
      },
      instagramUrl: INSTAGRAM_URL,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to load the current event.';

    return res.status(500).json({ error: message });
  }
}