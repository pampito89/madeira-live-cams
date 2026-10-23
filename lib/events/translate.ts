import type { Locale } from '../i18n/config';
import type { ImportedEvent } from './types';
import { plainText } from './adapters';
import { readCache, writeCache, reserveTranslation } from './cache';
type Translation = { text: string | null; retryAfter: number };
const pending = new Map<string, Promise<string | null>>();
export async function translatedTitle(text: string, from: string, to: Locale, allowNetwork = true): Promise<string | null> {
  if (from === to) return text;
  const key = `title:${from}:${to}:${text}`;
  const saved = await readCache<Translation>(key);
  if (saved?.text) return saved.text;
  if (!allowNetwork || (saved && saved.retryAfter > Date.now()) || Buffer.byteLength(text, 'utf8') > 500) return null;
  if (pending.has(key)) return pending.get(key)!;
  const work = (async () => {
    if (!await reserveTranslation(text.length)) return null;
    try {
      const url = new URL('https://api.mymemory.translated.net/get');
      url.searchParams.set('q', text); url.searchParams.set('langpair', `${from}|${to}`);
      const response = await fetch(url, { signal: AbortSignal.timeout(2500), redirect: 'error' });
      if (!response.ok) throw new Error('Translation unavailable');
      const result = await response.json();
      const translated = plainText(result.responseData?.translatedText);
      if (Number(result.responseStatus) !== 200 || result.quotaFinished || !translated || translated.length > 600 || /MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(translated)) throw new Error('Translation unavailable');
      await writeCache(key, { text: translated, retryAfter: 0 }); return translated;
    } catch { await writeCache(key, { text: null, retryAfter: Date.now() + 60 * 60_000 }); return null; }
  })();
  pending.set(key, work);
  try { return await work; } finally { pending.delete(key); }
}
export async function localizeEvents(events: ImportedEvent[], locale: Locale) {
  const deadline = Date.now() + 6000;
  const result = events.map(event => ({ ...event }));
  let cursor = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (cursor < result.length) {
      const index = cursor++; const event = result[index];
      const title = await translatedTitle(event.originalTitle, event.sourceLanguage, locale, Date.now() < deadline);
      result[index] = { ...event, title: title || event.originalTitle, translation: event.sourceLanguage === locale ? 'source' : title ? 'machine' : 'original' };
    }
  }));
  return result;
}
