import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Redis } from '@upstash/redis';
import seedChecked from '../data/civil-protection-feed-checked.json';

export const NEWS_SOURCE = 'https://procivmadeira.pt/pt/10-noticias.html';
export const NEWS_FEED = `${NEWS_SOURCE}?format=feed&type=rss`;
export type NewsArticle = { id: string; title: string; sourceUrl: string; publishedAt: string; paragraphs: string[] };
export type NewsSnapshot = { articles: NewsArticle[]; checkedAt: string; stale: boolean };
const interval = 10 * 60 * 1000;
const key = 'civil-protection:news:v1';
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null;
const cacheFile = path.join(process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), 'backups'), 'civil-protection-news.json');
let memory: NewsSnapshot | null = null;
let pending: Promise<NewsSnapshot> | null = null;
let retryAfter = 0;

function decode(value: string): string {
  const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (match, entity: string) => {
    if (!entity.startsWith('#')) return entities[entity.toLowerCase()] ?? match;
    const number = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : '';
  });
}
function field(item: string, tag: string): string {
  return (item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] ?? '').replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim();
}
// Render these strings as React text, never as upstream HTML. No remote media or scripts.
export function newsParagraphs(html: string): string[] {
  return decode(html.replace(/<(script|style|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/(?:p|li|h[1-6]|div)>|<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]*>/g, '')).split(/\n+/).map(part => part.replace(/\s+/g, ' ').trim()).filter(Boolean);
}
export function parseNewsFeed(xml: string): NewsArticle[] {
  if (!/<rss\b/i.test(xml) || /<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('Invalid news feed');
  const articles = new Map<string, NewsArticle>();
  for (const match of Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi))) {
    const item = match[1];
    try {
      const url = new URL(decode(field(item, 'link')));
      const id = url.pathname.match(/^\/pt\/10-noticias\/(\d+)-[^/]+\.html$/)?.[1];
      if (url.protocol !== 'https:' || !['procivmadeira.pt', 'www.procivmadeira.pt'].includes(url.hostname) || url.port || url.username || url.password || !id) continue;
      const title = newsParagraphs(field(item, 'title')).join(' ');
      const paragraphs = newsParagraphs(field(item, 'description'));
      const published = Date.parse(field(item, 'pubDate'));
      if (!title || !paragraphs.length || !Number.isFinite(published)) continue;
      articles.set(id, { id, title, paragraphs, sourceUrl: url.href, publishedAt: new Date(published).toISOString() });
    } catch { /* Ignore malformed or non-official entries. */ }
  }
  if (!articles.size) throw new Error('No valid official news');
  return Array.from(articles.values()).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
async function readStored(): Promise<NewsSnapshot | null> {
  try { return redis ? await redis.get<NewsSnapshot>(key) : JSON.parse(await fs.readFile(cacheFile, 'utf8')); } catch { return null; }
}
async function saveStored(snapshot: NewsSnapshot) {
  try {
    if (redis) { await redis.set(key, snapshot); return; }
    await fs.mkdir(path.dirname(cacheFile), { recursive: true });
    const temporary = `${cacheFile}.${process.pid}.tmp`;
    await fs.writeFile(temporary, JSON.stringify(snapshot), 'utf8');
    await fs.rename(temporary, cacheFile);
  } catch { /* Successful feed remains usable even if persistence is unavailable. */ }
}
async function refresh(): Promise<NewsSnapshot> {
  const stored = memory ?? await readStored();
  const seed = (): Promise<NewsSnapshot> => fs.readFile(path.join(process.cwd(), 'data', 'civil-protection-feed.xml'), 'utf8')
    .then(xml => ({ articles: parseNewsFeed(xml), checkedAt: seedChecked, stale: true }));
  const previous = stored ?? await seed();
  if (Date.now() < retryAfter) return { ...previous, stale: true };
  if (!previous.stale && Date.now() - Date.parse(previous.checkedAt) < interval) return memory = previous;
  try {
    const response = await fetch(NEWS_FEED, { signal: AbortSignal.timeout(8000), redirect: 'error', headers: { Accept: 'application/rss+xml, application/xml' } });
    if (!response.ok) throw new Error('News feed unavailable');
    const xml = await response.text();
    if (xml.length > 2_000_000) throw new Error('News feed too large');
    const incoming = parseNewsFeed(xml);
    const archive = new Map(previous.articles.map(article => [article.id, article]));
    incoming.forEach(article => archive.set(article.id, article));
    memory = { articles: Array.from(archive.values()).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), checkedAt: new Date().toISOString(), stale: false };
    await saveStored(memory);
    return memory;
  } catch {
    retryAfter = Date.now() + 60_000;
    return memory = { ...previous, stale: true };
  }
}
export function getCivilProtectionNews(): Promise<NewsSnapshot> {
  if (!pending) pending = refresh().finally(() => { pending = null; });
  return pending;
}
