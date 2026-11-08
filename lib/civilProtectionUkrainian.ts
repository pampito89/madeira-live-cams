import { readFile } from 'node:fs/promises';
import path from 'node:path';
import translations from '../data/civil-protection-uk.json';
import { parseNewsFeed, type NewsArticle } from './civilProtectionNews';
import { translatedTitle } from './events/translate';

export type UkrainianNewsArticle = NewsArticle & { contentLanguage: 'uk' | 'pt'; translationKind: 'edited' | 'machine' | 'original' };
type Translation = { title: string; paragraphs: string[] };
let originals: Promise<NewsArticle[]> | undefined;
const catalog = translations as Record<string, Translation>;
function chunks(text: string): string[] {
  const result: string[] = [];
  let current = '';
  for (const word of text.split(/\s+/)) {
    const next = current ? `${current} ${word}` : word;
    if (Buffer.byteLength(next, 'utf8') > 450 && current) { result.push(current); current = word; }
    else current = next;
  }
  if (current) result.push(current);
  return result;
}
export async function ukrainianArticle(article: NewsArticle, full = true): Promise<UkrainianNewsArticle> {
  originals ??= readFile(path.join(process.cwd(), 'data', 'civil-protection-feed.xml'), 'utf8').then(parseNewsFeed);
  const original = (await originals).find(item => item.id === article.id);
  const curated = catalog[article.id];
  // Never apply an old translation to a corrected official announcement.
  if (curated && original?.title === article.title && JSON.stringify(original.paragraphs) === JSON.stringify(article.paragraphs)) {
    return { ...article, ...curated, contentLanguage: 'uk', translationKind: 'edited' };
  }
  const source = full ? article.paragraphs : [article.paragraphs.find(paragraph => paragraph.length > 80) ?? article.paragraphs[0]];
  const deadline = Date.now() + 12_000;
  const translate = async (text: string) => {
    const parts: string[] = [];
    for (const part of chunks(text)) {
      const translated = await translatedTitle(part, 'pt', 'uk', Date.now() < deadline);
      if (!translated) return null;
      parts.push(translated);
    }
    return parts.join(' ');
  };
  const title = await translate(article.title);
  const paragraphs: string[] = [];
  if (title) for (const paragraph of source) {
    const translated = await translate(paragraph);
    if (!translated) break;
    paragraphs.push(translated);
  }
  if (title && paragraphs.length === source.length) return { ...article, title, paragraphs, contentLanguage: 'uk', translationKind: 'machine' };
  return { ...article, contentLanguage: 'pt', translationKind: 'original' };
}
