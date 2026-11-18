import { useEffect, useState } from 'react';
import { freshStatus, type LocationStatus, type LocationStatusFeed } from './locationStatus';

const CACHE_KEY = 'madeira:location-status:v1';
type Statuses = Record<string, LocationStatus>;
function clean(input: unknown): Statuses {
  const result: Statuses = {};
  if (input && typeof input === 'object') {
    for (const [slug, entry] of Object.entries(input)) {
      const status = freshStatus(entry as LocationStatus);
      if (status) result[slug] = status;
    }
  }
  return result;
}

export function useLocationStatuses(initialStatuses: Statuses) {
  // The same server snapshot is used for HTML and hydration: no unknown-first flash.
  const [statuses, setStatuses] = useState<Statuses>(initialStatuses);
  useEffect(() => {
    let active = true;
    let busy = false;
    const controller = new AbortController();
    setStatuses(clean(initialStatuses));
    // Never replace the server snapshot with an older browser cache.
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(clean(initialStatuses))); } catch { /* Storage is optional. */ }
    const load = async () => {
      if (busy || document.visibilityState === 'hidden') return;
      busy = true;
      try {
        const response = await fetch('/api/location-status', { signal: controller.signal });
        if (!response.ok) throw new Error('Status source unavailable');
        const feed: LocationStatusFeed = await response.json();
        const next = clean(feed.statuses);
        if (!active) return;
        setStatuses(next);
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch { /* Storage is optional. */ }
      } catch {
        if (active) {
          setStatuses({});
          try { sessionStorage.removeItem(CACHE_KEY); } catch { /* Storage is optional. */ }
        }
      } finally { busy = false; }
    };
    const wake = () => { setStatuses(previous => clean(previous)); void load(); };
    // The server has just checked the source; refresh periodically, without a duplicate mount request.
    const polling = window.setInterval(wake, 60_000);
    const expiry = window.setInterval(() => setStatuses(previous => clean(previous)), 10_000);
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('online', wake);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(polling);
      window.clearInterval(expiry);
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('online', wake);
    };
  }, [initialStatuses]);
  return statuses;
}
