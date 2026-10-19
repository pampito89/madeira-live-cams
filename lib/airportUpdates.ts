export type AirportNotice = { title: string; url: string; publishedAt: string };
export type AirportWarning = { type: string; level: 'yellow' | 'orange' | 'red'; start: string; end: string };
export type AirportUpdates = { fetchedAt: string; news: AirportNotice[]; warnings: AirportWarning[]; newsAvailable: boolean; warningsAvailable: boolean };
const clean = (value: string) => value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").trim();
export function parseAirportNews(xml: string, now = Date.now()): AirportNotice[] {
  if (!/<rss\b/i.test(xml) || !/<channel[\s>]/i.test(xml)) throw new Error('Invalid RSS');
  const notices: AirportNotice[] = [];
  for (const match of Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi))) {
    const field = (tag: string) => clean(match[1].match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] || '');
    const title = field('title'), url = field('link'), date = Date.parse(field('pubDate'));
    if (!/madeira|\bFNC\b|\bLPMA\b/i.test(title) || !Number.isFinite(date) || date > now || now - date > 60 * 86400_000) continue;
    try { const parsed = new URL(url); if (parsed.protocol !== 'https:' || parsed.hostname !== 'pt.newsroom.ana.pt') continue; } catch { continue; }
    if (!notices.some(n => n.url === url)) notices.push({ title: title.slice(0, 300), url, publishedAt: new Date(date).toISOString() });
  }
  return notices.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 5);
}
export function parseAirportWarnings(value: unknown, now = Date.now()): AirportWarning[] {
  if (!Array.isArray(value)) throw new Error('Invalid warnings');
  const area = value.filter(row => row?.idAreaAviso === 'MCS');
  const utc = (value: unknown) => typeof value === 'string' ? Date.parse(/(?:Z|[+-]\d\d:\d\d)$/.test(value) ? value : `${value}Z`) : NaN;
  if (!area.some(row => utc(row.endTime) > now)) throw new Error('Missing or expired region');
  return area.flatMap((row): AirportWarning[] => {
    const start = utc(row.startTime), end = utc(row.endTime);
    if (!['yellow', 'orange', 'red'].includes(row.awarenessLevelID) || !Number.isFinite(start) || !Number.isFinite(end) || end <= now || end <= start || start > now + 72 * 3600_000) return [];
    return [{ type: String(row.awarenessTypeName).slice(0, 100), level: row.awarenessLevelID, start: new Date(start).toISOString(), end: new Date(end).toISOString() }];
  }).sort((a, b) => a.start.localeCompare(b.start));
}
