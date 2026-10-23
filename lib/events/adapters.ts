import { municipalities, type IslandEvent } from '../../data/events';
import type { ImportedEvent } from './types';
export function plainText(input: unknown): string {
  if (typeof input !== 'string') return '';
  const entities: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…' };
  return input.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' ').replace(/&#(x[\da-f]+|\d+);/gi, (_, code) => {
    const number = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
    return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : '';
  }).replace(/&([a-z]+);/gi, (whole, key) => entities[key] ?? whole).replace(/\s+/g, ' ').trim();
}
export function safeUrl(value: unknown, host?: string): string | null {
  if (typeof value !== 'string') return null;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && (!host || url.hostname === host) ? url.toString() : null; } catch { return null; }
}
export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function inferMunicipalities(value: string) {
  const normalized = normalize(value);
  const found = municipalities.filter(name => normalized.includes(normalize(name)));
  const aliases: Record<string, typeof municipalities[number]> = { 'paul do mar': 'Calheta', 'faial': 'Santana', 'curral das freiras': 'Câmara de Lobos' };
  Object.entries(aliases).forEach(([alias, municipality]) => { if (normalized.includes(alias) && !found.includes(municipality)) found.push(municipality); });
  return found;
}
function categoryFor(value: string): IslandEvent['category'] {
  const text = normalize(value);
  if (/sport|rally|rali|karting|race|desporto/.test(text)) return 'Sport';
  if (/gastronomy|gastronomia|food/.test(text)) return 'Food';
  if (/nightlife|disco|dj|party/.test(text)) return 'Nightlife';
  if (/music|concert|musica/.test(text)) return 'Music';
  if (/talk|conference|lecture/.test(text)) return 'Talks';
  if (/christmas|festival|arraia|festa/.test(text)) return 'Festivals';
  return 'Culture';
}
// Source-specific template: bounded card sections; no scripts or source descriptions are rendered.
export function parseEventsMadeira(html: string, fetchedAt: string): ImportedEvent[] {
  if (!html.includes('gt-event-style-3')) throw new Error('Events Madeira template changed');
  const records = new Map<string, ImportedEvent>();
  for (const block of html.split(/<div\s+class="gt-event-style-3">/).slice(1)) {
    const titleMatch = block.match(/<div class="gt-title">\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    const dateMatch = block.match(/<div class="gt-date">[\s\S]*?<span>([^<]+)<\/span>/);
    if (!titleMatch || !dateMatch) continue;
    const sourceUrl = safeUrl(titleMatch[1], 'eventsmadeira.com');
    const title = plainText(titleMatch[2]).slice(0, 240);
    const status = plainText(block.match(/<div class="gt-event-status">([\s\S]*?)<\/div>/)?.[1]);
    if (!sourceUrl || !new URL(sourceUrl).pathname.startsWith('/en/event/') || !title || /cancelled|canceled|postponed/i.test(`${title} ${status}`)) continue;
    const dates = Array.from(dateMatch[1].matchAll(/(\d{2})\/(\d{2})\/(\d{4})/g), match => `${match[3]}-${match[2]}-${match[1]}`);
    const start = dates[0]; const end = dates[1] || start;
    if (!start || !validDate(start) || !validDate(end) || end < start) continue;
    const places = Array.from(block.matchAll(/href="https:\/\/eventsmadeira\.com\/en\/location\/[^\"]+"[^>]*>([^<]+)<\/a>/g), match => plainText(match[1]));
    const regions = inferMunicipalities(places.join(' '));
    const categories = block.match(/<div class="gt-category">([\s\S]*?)<\/div>/)?.[1] || '';
    const id = `eventsmadeira:${new URL(sourceUrl).pathname.split('/').filter(Boolean).pop()}`;
    records.set(id, { id, title, originalTitle: title, description: '', start, end, municipalities: regions, category: categoryFor(plainText(categories)), venue: regions.join(' · ') || 'Madeira', source: 'Events Madeira', sourceId: 'eventsmadeira', sourceLanguage: 'en', sourceUrl, checkedAt: fetchedAt.slice(0, 10), fetchedAt, translation: 'source' });
  }
  if (!records.size) throw new Error('No valid Events Madeira cards');
  return Array.from(records.values());
}
export function parseAmak(payload: unknown, fetchedAt: string): ImportedEvent[] {
  const data = payload as { events?: unknown[] };
  if (!data || !Array.isArray(data.events)) throw new Error('Invalid AMAK response');
  return data.events.flatMap(item => {
    const raw = item as Record<string, unknown>;
    if (raw.status !== 'publish' || raw.hide_from_listings === true) return [];
    const title = plainText(raw.title).slice(0, 240);
    const sourceUrl = safeUrl(raw.url, 'amak.pt');
    const start = String(raw.start_date || '').slice(0, 10); const end = String(raw.end_date || '').slice(0, 10);
    if (!title || !sourceUrl || !validDate(start) || !validDate(end) || end < start || /cancelad|adiad/i.test(title)) return [];
    const venue = raw.venue as { venue?: string; city?: string } | undefined;
    const regions = inferMunicipalities(`${title} ${plainText(venue?.city)} ${plainText(venue?.venue)}`);
    return [{ id: `amak:${String(raw.id)}`, title, originalTitle: title, description: '', start, end, municipalities: regions, category: 'Sport' as const, venue: plainText(venue?.venue) || regions.join(' · ') || 'Madeira', source: 'AMAK', sourceId: 'amak' as const, sourceLanguage: 'pt' as const, sourceUrl, checkedAt: fetchedAt.slice(0, 10), fetchedAt, translation: 'source' as const }];
  });
}
export function deduplicate(events: ImportedEvent[]) {
  const seen = new Set<string>();
  return events.filter(event => {
    const key = `${normalize(event.originalTitle).replace(/[^a-z0-9]/g, '').replace(/202\d$/, '')}|${event.start}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}
