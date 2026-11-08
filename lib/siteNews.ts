import catalog from '../data/operational-news-uk.json';
import { getCivilProtectionNews } from './civilProtectionNews';
import { ukrainianArticle } from './civilProtectionUkrainian';
import { getOperationalNews, sourceFingerprint, type OperationalSource } from './operationalNews';
import { newsCategories, type NewsCategory, type SiteNewsArticle } from './newsTypes';

type Edited = { fingerprint: string; title: string; paragraphs: string[]; location: string; period: string; categories: NewsCategory[] };
export function editedOperational(article: OperationalSource): SiteNewsArticle | null {
  const edited = (catalog as Record<string, Edited>)[article.id];
  if (!edited || edited.fingerprint !== sourceFingerprint(article)) return null;
  const { fingerprint: _, ...content } = edited;
  return { ...article, ...content, contentLanguage: 'uk', translationKind: 'edited' };
}
export function newsCategory(value: unknown): keyof typeof newsCategories {
  return typeof value === 'string' && Object.hasOwn(newsCategories, value) ? value as keyof typeof newsCategories : 'all';
}
export async function getNewsSources() {
  const [civil, operational] = await Promise.all([getCivilProtectionNews(), getOperationalNews()]);
  const recent = operational.filter(item => !item.publishedAt || item.id === 'dre-status' || Date.now() - Date.parse(item.publishedAt) < 365 * 86400000);
  const articles: OperationalSource[] = [...recent, ...civil.articles.map(item => ({ ...item, sourceName: 'SRPC — Цивільний захист Мадейри', checkedAt: civil.checkedAt, stale: civil.stale, categories: ['general'] as NewsCategory[], location: 'Мадейра', period: null }))];
  return { articles };
}
export async function localizeNews(source: OperationalSource, full = true): Promise<SiteNewsArticle> {
  const edited = editedOperational(source);
  if (edited) return edited;
  const translated = await ukrainianArticle({ ...source, publishedAt: source.publishedAt ?? '' }, full);
  return { ...source, ...translated, publishedAt: source.publishedAt };
}
export async function getSiteNews() {
  const source = await getNewsSources();
  return { articles: await Promise.all(source.articles.map(item => localizeNews(item, false))) };
}
