import { IFCN_STATUS_URL, parseIfcnStatuses, type LocationStatusFeed } from './locationStatus';

let cached: LocationStatusFeed | undefined;
let pending: Promise<LocationStatusFeed> | undefined;
let retryAt = 0;

async function refresh(): Promise<LocationStatusFeed> {
  const response = await fetch(IFCN_STATUS_URL, { signal: AbortSignal.timeout(5000), headers: { Accept: 'text/html' } });
  if (!response.ok) throw new Error('IFCN unavailable');
  const html = await response.text();
  if (html.length > 2_000_000) throw new Error('Unexpected IFCN response');
  const feed = parseIfcnStatuses(html);
  cached = feed;
  return feed;
}

// Shared by the initial server-rendered page and browser refreshes.
export async function getLocationStatusFeed(): Promise<LocationStatusFeed> {
  if (cached && Date.now() - Date.parse(cached.checkedAt) < 60_000) return cached;
  if (Date.now() < retryAt) throw new Error('IFCN retry pending');
  pending ??= refresh().catch(error => {
    retryAt = Date.now() + 30_000;
    throw error;
  }).finally(() => { pending = undefined; });
  return pending;
}
