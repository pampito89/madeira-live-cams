import { inferMunicipalities, plainText, safeUrl, validDate } from './adapters';
import type { ImportedEvent, EventSourceId } from './types';

type JsonObject = Record<string, unknown>;
const object = (value: unknown): JsonObject => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const hosts = new Set(['www.eventbrite.com', 'www.eventbrite.pt', 'www.eventbrite.co.uk']);
function eventUrl(value: unknown) {
 const safe = safeUrl(value); if (!safe) return null;
 const url = new URL(safe);
 if (!hosts.has(url.hostname) || !/^\/e\/(?:[a-z0-9-]+-)?\d+\/?$/i.test(url.pathname)) return null;
 url.search = ''; url.hash = ''; return url.toString();
}
function localDay(value: unknown) {
 if (typeof value !== 'string') return null;
 if (validDate(value)) return value;
 if (!validDate(value.slice(0,10)) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) return null;
 return new Intl.DateTimeFormat('sv-SE', {timeZone:'Atlantic/Madeira',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
}
function languageFor(title: string, declared: unknown): ImportedEvent['sourceLanguage'] {
 const language = plainText(declared).slice(0,2).toLowerCase();
 if (language === 'en' || language === 'pt' || language === 'es') return language;
 const name = normalize(title);
 if (/\b(noche|regreso|edicion|venezolana|viajeros|navidad)\b/.test(name)) return 'es';
 if (/\b(natal|noite|festa|concerto|historias|tres|musica|bilhetes|gastronomia|exposicao)\b/.test(name)) return 'pt';
 return 'en';
}
function municipalityFor(location: JsonObject): string[] | null {
 const address = object(location.address); const geo = object(location.geo);
 const country = plainText(typeof address.addressCountry === 'string' ? address.addressCountry : object(address.addressCountry).name);
 if (country && !/^(PT|Portugal)$/i.test(country)) return null;
 const latitude = Number(geo.latitude); const longitude = Number(geo.longitude);
 const hasCoordinates = geo.latitude != null && geo.longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude);
 const inMadeira = hasCoordinates && latitude >= 32.3 && latitude <= 33.25 && longitude >= -17.4 && longitude <= -16.1;
 if (hasCoordinates && !inMadeira) return null;
 const city = plainText(address.addressLocality); const region = plainText(address.addressRegion);
 const municipalities = inferMunicipalities(city);
 const aliases: Record<string,string> = { gaula:'Santa Cruz', canico:'Santa Cruz', camacha:'Santa Cruz', canical:'Machico', 'porto da cruz':'Machico', 'agua de pena':'Machico', 'jardim da serra':'Câmara de Lobos', 'estreito de camara de lobos':'Câmara de Lobos' };
 const alias = aliases[normalize(city)]; if (alias && !municipalities.includes(alias as typeof municipalities[number])) municipalities.push(alias as typeof municipalities[number]);
 if (!inMadeira && !/madeira/i.test(region) && !municipalities.length) return null;
 if (region && !/madeira/i.test(region) && !inMadeira) return null;
 return municipalities;
}
// Read only the pagination metadata embedded in the public search page; never execute scripts.
export function eventbritePagination(html: string): { pages: number; count: number } | null {
 const match = html.match(/"events"\s*:\s*\{\s*"pagination"\s*:\s*(\{[^{}]{1,1000}\})/);
 if (!match) return null;
 try {
  const data = JSON.parse(match[1]);
  if (!Number.isInteger(data.page_count) || data.page_count < 0 || !Number.isInteger(data.object_count) || data.object_count < 0) return null;
  return { pages: data.page_count, count: data.object_count };
 } catch { return null; }
}
function generalCategory(title: string, hints: string): ImportedEvent['category'] {
 const name = normalize(title);
 if (/\b(lecture|conference|seminar|palestra|conferencia|business networking)\b/.test(name)) return 'Talks';
 if (/\b(gastronomy|gastronomia|food|wine tasting|degustacao|culinaria|cooking|brunch|jantar|almoco)\b/.test(name)) return 'Food';
 if (/\b(dj|djs|rave|techno|reggaeton|clubbing|disco|electronic|electronica|eletronica|party|fiesta|halloween)\b/.test(hints)) return 'Nightlife';
 if (/\b(concert|concerto|music|musica|guitar|orchestra|orquestra)\b/.test(name)) return 'Music';
 if (/\b(festival|fest|christmas|natal|navidad|carnaval|arraial|festa)\b/.test(name)) return 'Festivals';
 return 'Culture';
}
export function parseEventbrite(html: string, fetchedAt: string, kind: 'parties' | 'music' | 'all', sourceId?: EventSourceId): ImportedEvent[] {
 const nodes: JsonObject[] = []; let hasListing = false;
 function visit(value: unknown, depth = 0) {
   if (depth > 8) return;
   if (Array.isArray(value)) { value.forEach(item => visit(item, depth + 1)); return; }
   const item = object(value); const type = item['@type']; const types = Array.isArray(type) ? type : [type];
   if (types.includes('ItemList')) hasListing = true;
   if (types.some(value => typeof value === 'string' && /^(Event|MusicEvent|DanceEvent|Festival|SportsEvent|FoodEvent|TheaterEvent|ExhibitionEvent|BusinessEvent)$/.test(value))) nodes.push(item);
   ['@graph','itemListElement','item'].forEach(key => { if (item[key]) visit(item[key], depth + 1); });
 }
 for (const match of Array.from(html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))) {
   try { visit(JSON.parse(match[1])); } catch { /* Ignore unrelated invalid schema blocks. */ }
 }
 if (!hasListing) {
   const pagination = eventbritePagination(html);
   if (pagination?.count === 0 && pagination.pages === 0 && /"current_page"\s*:\s*"search"/.test(html)) return [];
   throw new Error('Eventbrite listing template unavailable');
 }
 const events = new Map<string, ImportedEvent>();
 for (const raw of nodes) {
   const sourceUrl = eventUrl(raw.url); const title = plainText(raw.name).slice(0,240);
   const status = plainText(raw.eventStatus);
   if (!sourceUrl || !title || /EventCancelled|EventPostponed/i.test(status) || /OnlineEventAttendanceMode$/.test(plainText(raw.eventAttendanceMode))) continue;
   const start = localDay(raw.startDate); const end = raw.endDate ? localDay(raw.endDate) : start;
   if (!start || !end || end < start) continue;
   const location = object(raw.location); const municipalities = municipalityFor(location);
   if (!municipalities) continue;
   const venue = plainText(location.name).slice(0,200) || municipalities.join(' · ') || 'Madeira';
   const hints = normalize(`${title} ${plainText(raw.description)} ${venue}`);
   const category = kind === 'all' ? generalCategory(title, hints)
     : /\b(dj|djs|rave|techno|reggaeton|clubbing|club|disco|electronic|electronica|eletronica|house music)\b/.test(hints) ? 'Nightlife'
     : /\b(hangout|meetup|travellers|travelers)\b/.test(hints) ? 'Culture'
     : kind === 'parties' ? 'Nightlife' : 'Music';
   const number = new URL(sourceUrl).pathname.match(/(\d+)\/?$/)![1];
   const id = `eventbrite:${number}`;
   events.set(id, { id, title, originalTitle:title, description:'', start, end, municipalities, category, venue, source: 'Eventbrite', sourceId: sourceId || (kind === 'parties' ? 'eventbrite-parties' : kind === 'music' ? 'eventbrite-music' : 'eventbrite-madeira'), sourceLanguage: languageFor(title, raw.inLanguage), sourceUrl, ticketUrl:sourceUrl, checkedAt:fetchedAt.slice(0,10), fetchedAt, translation:'source' });
 }
 return Array.from(events.values());
}
export async function loadEventbritePages(endpoint: string, fetchedAt: string, kind: 'parties' | 'music' | 'all', sourceId: EventSourceId, fetchPage: (url: string) => Promise<string>, first: string): Promise<ImportedEvent[]> {
 const events = parseEventbrite(first, fetchedAt, kind, sourceId);
 const pages = Math.max(1, eventbritePagination(first)?.pages || 1);
 // Fail explicitly rather than silently publishing a truncated or partially fetched catalogue.
 if (pages > 10) throw new Error('Eventbrite catalogue exceeds page budget');
 for (let page = 2; page <= pages; page += 3) {
   const batch = Array.from({length: Math.min(3, pages - page + 1)}, (_, i) => page + i);
   const results = await Promise.all(batch.map(async number => {
     const url = new URL(endpoint); url.searchParams.set('page', String(number));
     return parseEventbrite(await fetchPage(url.toString()), fetchedAt, kind, sourceId);
   }));
   events.push(...results.flat());
 }
 return mergeImportedEvents(events);
}
export function mergeImportedEvents(events: ImportedEvent[]) {
 const seenIds = new Set<string>(); const seenTitles = new Set<string>();
 return events.filter(event => {
   const titleKey = `${normalize(event.originalTitle).replace(/[^a-z0-9]/g,'').replace(/202\d$/,'')}|${event.start}`;
   if (seenIds.has(event.id) || seenTitles.has(titleKey)) return false;
   seenIds.add(event.id); seenTitles.add(titleKey); return true;
 });
}
