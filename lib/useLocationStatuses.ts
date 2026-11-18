import { useEffect, useState } from 'react';
import { freshStatus, type LocationStatus, type LocationStatusFeed } from './locationStatus';
const CACHE_KEY = 'madeira:location-status:v1';
export function useLocationStatuses() {
  const [statuses, setStatuses] = useState<Record<string, LocationStatus>>({});
  useEffect(() => {
    let active = true;
    let busy = false;
    const controller = new AbortController();
    const clean = (input: unknown) => {
      const result: Record<string, LocationStatus> = {};
      if (input && typeof input === 'object') {
        for (const [slug, entry] of Object.entries(input)) {
          const status = freshStatus(entry as LocationStatus);
          if (status) result[slug] = status;
        }
      }
      return result;
    };
    try { setStatuses(clean(JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? '{}'))); } catch { /* Storage is optional. */ }
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
    void load();
    const polling = window.setInterval(wake, 60_000);
    const expiry = window.setInterval(() => setStatuses(previous => clean(previous)), 10_000);
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('online', wake);
    return () => { active = false; controller.abort(); window.clearInterval(polling); window.clearInterval(expiry); document.removeEventListener('visibilitychange', wake); window.removeEventListener('online', wake); };
  }, []);
  return statuses;
}
