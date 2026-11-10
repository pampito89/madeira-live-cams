import catalog from '../data/operational-news-uk.json';
import seed from '../data/operational-news-seed.json';
import { getCivilProtectionNews } from './civilProtectionNews';
import { ukrainianArticle } from './civilProtectionUkrainian';
import { getOperationalNews, sourceFingerprint, type OperationalSource } from './operationalNews';
import { newsCategories, type NewsCategory, type SiteNewsArticle } from './newsTypes';
import { readCache, writeCache } from './events/cache';
import { baseNewsId, classifyNews, mergeNewsLedger, type ManagedNews, type NewsLedger } from './newsLifecycle';

type Edited = { fingerprint: string; title: string; paragraphs: string[]; location: string; period: string; categories: NewsCategory[] };
export function editedOperational(article: OperationalSource): SiteNewsArticle | null {
  const edited = (catalog as Record<string, Edited>)[baseNewsId(article.id)];
  if (!edited || edited.fingerprint !== sourceFingerprint(article)) return null;
  const { fingerprint: _, ...content } = edited;
  return { ...article, ...content, contentLanguage: 'uk', translationKind: 'edited' };
}
export function newsCategory(value: unknown): keyof typeof newsCategories {
  return typeof value === 'string' && Object.hasOwn(newsCategories, value) ? value as keyof typeof newsCategories : 'all';
}
const ledgerKey = 'site-news-ledger:v1';
let pending: Promise<{ articles: ManagedNews[] }> | null = null;
async function refreshSources() {
  const [civil, operational, saved] = await Promise.all([getCivilProtectionNews(), getOperationalNews(), readCache<NewsLedger>(ledgerKey)]);
  const incoming: OperationalSource[] = [...operational, ...civil.articles.map(item => ({ ...item, sourceName: 'SRPC — Цивільний захист Мадейри', checkedAt: civil.checkedAt, stale: civil.stale, categories: ['general'] as NewsCategory[], location: 'Мадейра', period: null }))];
  const initial = { latest: seed.articles as OperationalSource[], revisions: [] };
  const ledger = mergeNewsLedger(saved ?? initial, incoming);
  await writeCache(ledgerKey, ledger);
  const articles = [...classifyNews(ledger.latest), ...ledger.revisions].sort((a, b) => (b.sortDate ?? '').localeCompare(a.sortDate ?? '') || a.id.localeCompare(b.id));
  return { articles };
}
export function getNewsSources() {
  return pending ??= refreshSources().finally(() => { pending = null; });
}
export async function localizeNews(source: ManagedNews, full = true): Promise<SiteNewsArticle> {
  const edited = editedOperational(source);
  if (edited) return edited;
  const translated = await ukrainianArticle({ ...source, id: baseNewsId(source.id), publishedAt: source.publishedAt ?? '' }, full);
  return { ...source, ...translated, id: source.id, publishedAt: source.publishedAt };
}
export async function getSiteNews() {
  const source = await getNewsSources();
  return { articles: await Promise.all(source.articles.map(item => item.newsState === 'archived' && !/^\d/.test(item.id)
    ? Promise.resolve(editedOperational(item) ?? { ...item, contentLanguage: 'pt' as const, translationKind: 'original' as const })
    : localizeNews(item, false))) };
}
