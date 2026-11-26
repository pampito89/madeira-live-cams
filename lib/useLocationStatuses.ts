import { useEffect, useState } from 'react';
import { freshStatus, type LocationStatus, type LocationStatusFeed } from './locationStatus';

const CACHE_KEY = 'madeira:location-status:v1';
const CLIENT_REUSE_MS = 12 * 60 * 60_000;
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
function readSessionCache(): Statuses | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = clean(JSON.parse(raw));
    const entries = Object.values(parsed);
    if (!entries.length) return null;
    const newest = Math.max(...entries.map(entry => Date.parse(entry.checkedAt)));
    return Number.isFinite(newest) && Date.now() - newest < CLIENT_REUSE_MS ? parsed : null;
  } catch {
    return null;
  }
}

export function useLocationStatuses(initialStatuses: Statuses, refreshOnMount = false) {
  const [statuses, setStatuses] = useState<Statuses>(initialStatuses);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const cleanedInitial = clean(initialStatuses);
    if (Object.keys(cleanedInitial).length > 0) {
      setStatuses(cleanedInitial);
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(cleanedInitial)); } catch { /* Storage is optional. */ }
      return () => { active = false; controller.abort(); };
    }
    const cached = readSessionCache();
    if (cached) {
      setStatuses(cached);
      return () => { active = false; controller.abort(); };
    }
    if (!refreshOnMount) {
      setStatuses({});
      return () => { active = false; controller.abort(); };
    }
    const load = async () => {
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
      }
    };
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [initialStatuses, refreshOnMount]);
  return statuses;
}
