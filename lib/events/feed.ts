import { madeiraDate } from '../events';
import type { Locale } from '../i18n/config';
import { categories } from '../../data/events';
import { eventPosters } from '../../data/event-posters';
import { parseEventsMadeira, parseAmak, safeUrl } from './adapters';
import { parseEventbrite, mergeImportedEvents } from './eventbrite';
import { readCache, writeCache } from './cache';
import { localizeEvents } from './translate';
import { eventText } from './text';
import type { EventFeed, ImportedEvent, SourceSnapshot, SourceState } from './types';
export const SOURCES = [
 { id: 'eventsmadeira', name: 'Events Madeira', url: 'https://eventsmadeira.com/en/event-listing/', endpoint: 'https://eventsmadeira.com/en/event-listing/', format: 'html' },
 { id: 'amak', name: 'AMAK', url: 'https://amak.pt/proximos-eventos/', endpoint: 'https://amak.pt/wp-json/tribe/events/v1/events?per_page=50', format: 'json' },
 // Parties precede music so cross-listed club nights keep the nightlife category.
 { id: 'eventbrite-parties', name: 'Eventbrite · Parties', url: 'https://www.eventbrite.com/d/portugal--funchal/parties/', endpoint: 'https://www.eventbrite.com/d/portugal--funchal/parties/', format: 'parties' },
 { id: 'eventbrite-music', name: 'Eventbrite · Music', url: 'https://www.eventbrite.com/b/portugal--funchal/music/', endpoint: 'https://www.eventbrite.com/b/portugal--funchal/music/', format: 'music' },
] as const;
const FRESH_MS = 30 * 60_000;
const STALE_MS = 7 * 24 * 60 * 60_000;
const inflight = new Map<string, Promise<SourceSnapshot>>();
export async function fetchText(url: string): Promise<string> {
 const response = await fetch(url, { headers: { 'User-Agent': 'MadeiraLiveCams/1.0 (+https://madeiralivecams.com)' }, signal: AbortSignal.timeout(8000), redirect: 'error' });
 if (!response.ok || !response.body) throw new Error('Source unavailable');
 const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
 try { while (true) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > 2_000_000) throw new Error('Source too large'); chunks.push(part.value); } }
 finally { await reader.cancel().catch(() => {}); }
 return Buffer.concat(chunks).toString('utf8');
}
export function sourceView(source: typeof SOURCES[number], snapshot: SourceSnapshot, now: number): { events: ImportedEvent[]; state: SourceState } {
 const age = now - Date.parse(snapshot.fetchedAt);
 const usable = Number.isFinite(age) && age <= STALE_MS;
 const fresh = usable && age < FRESH_MS && !snapshot.retryAfter;
 return { events: usable ? snapshot.events : [], state: { id: source.id, name: source.name, url: source.url, status: fresh ? 'fresh' : usable ? 'stale' : 'unavailable', fetchedAt: snapshot.fetchedAt || null, count: usable ? snapshot.events.length : 0 } };
}
async function loadSource(source: typeof SOURCES[number]) {
 const key = `source:${source.id}`; const now = Date.now();
 const saved = await readCache<SourceSnapshot>(key);
 if (saved?.version === 1 && (now < saved.retryAfter || now - Date.parse(saved.fetchedAt) < FRESH_MS)) return sourceView(source, saved, now);
 let work = inflight.get(key);
 if (!work) {
   work = (async (): Promise<SourceSnapshot> => {
     try {
       const fetchedAt = new Date().toISOString(); const body = await fetchText(source.endpoint);
       let events: ImportedEvent[];
       if (source.format === 'html') events = parseEventsMadeira(body, fetchedAt);
       else if (source.format === 'music' || source.format === 'parties') events = parseEventbrite(body, fetchedAt, source.format);
       else {
         const payload = JSON.parse(body); events = parseAmak(payload, fetchedAt);
         const pages = Math.min(Number(payload.total_pages) || 1, 4);
         for (let page = 2; page <= pages; page++) { const url = new URL(source.endpoint); url.searchParams.set('page', String(page)); events.push(...parseAmak(JSON.parse(await fetchText(url.toString())), fetchedAt)); }
       }
       const snapshot: SourceSnapshot = { version: 1, events, fetchedAt, retryAfter: 0 };
       await writeCache(key, snapshot); return snapshot;
     } catch {
       const snapshot: SourceSnapshot = { version: 1, events: saved?.events || [], fetchedAt: saved?.fetchedAt || '', retryAfter: now + 5 * 60_000 };
       await writeCache(key, snapshot); return snapshot;
     }
   })(); inflight.set(key, work);
 }
 try { return sourceView(source, await work, Date.now()); } finally { inflight.delete(key); }
}
export async function getEventFeed(locale: Locale): Promise<EventFeed> {
 const today = madeiraDate(); const loaded = await Promise.all(SOURCES.map(loadSource));
 const imported = mergeImportedEvents(loaded.flatMap(item => item.events)).filter(event => event.end >= today).sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
 const events = await localizeEvents(imported, locale); const text = eventText(locale);
 for (const event of events) {
   const category = text.categories[categories.indexOf(event.category)];
   event.description = `${category} · ${event.municipalities.join(' · ') || text.unknownVenue}. ${event.start !== event.end ? text.period : text.confirm}`;
   const poster = eventPosters[event.id];
   if (poster?.permission && poster.credit && (poster.src.startsWith('/images/events/') || safeUrl(poster.src))) event.image = poster;
 }
 return { events, sources: loaded.map(item => ({ ...item.state, count: imported.filter(event => event.sourceId === item.state.id).length })), today, locale, generatedAt: new Date().toISOString() };
}
