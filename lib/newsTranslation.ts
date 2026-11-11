import { createHash } from 'node:crypto';
import bundled from '../data/news-translations.json';
import { readCache, writeCache } from './events/cache';
import type { Locale } from './i18n/config';
export const translationKey = (text: string, from: string) => createHash('sha256').update(`${from}:${text}`).digest('hex');
const catalog = bundled as Record<string, Record<string, string>>;
const pending = new Map<string, Promise<string | null>>();
let running = 0;
const queue: (() => void)[] = [];
async function slot<T>(task: () => Promise<T>): Promise<T> {
  if (running >= 4) await new Promise<void>(resolve => queue.push(resolve));
  running++;
  try { return await task(); } finally { running--; queue.shift()?.(); }
}
export async function translateNewsText(text: string, from: string, to: Locale): Promise<string | null> {
  if (!text || from === to) return text;
  const hash = translationKey(text, from);
  if (catalog[to]?.[hash]) return catalog[to][hash];
  const key = `news-translation:v1:${to}:${hash}`;
  if (pending.has(key)) return pending.get(key)!;
  const work = (async () => {
    const saved = await readCache<{ text: string | null; retryAt: number }>(key);
    if (saved?.text) return saved.text;
    if (saved && saved.retryAt > Date.now()) return null;
    return slot(async () => {
      try {
        // Public news text only. Same translation service used by the site's catalogs.
        const parts = text.match(/[\s\S]{1,3000}(?:\s|$)|[\s\S]{1,3000}/g) ?? [text];
        const translated: string[] = [];
        for (const part of parts) {
          const url = new URL('https://translate.google.com/translate_a/single');
          for (const [key, value] of Object.entries({ client: 'gtx', sl: from, tl: to, dt: 't', q: part })) url.searchParams.set(key, value);
          const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(6000) });
          if (!response.ok) throw new Error('Translation unavailable');
          const result = await response.json();
          if (!Array.isArray(result?.[0])) throw new Error('Invalid translation response');
          const value = result[0].map((row: unknown[]) => typeof row?.[0] === 'string' ? row[0] : '').join('').trim();
          if (!value || value.length > part.length * 6 + 200) throw new Error('Empty translation');
          translated.push(value);
        }
        const value = translated.join(' ');
        await writeCache(key, { text: value, retryAt: 0 });
        return value;
      } catch {
        await writeCache(key, { text: null, retryAt: Date.now() + 60_000 });
        return null;
      }
    });
  })();
  pending.set(key, work);
  try { return await work; } finally { pending.delete(key); }
}
