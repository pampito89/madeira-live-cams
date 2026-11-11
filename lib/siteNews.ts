import catalog from '../data/operational-news-uk.json';
import seed from '../data/operational-news-seed.json';
import { getCivilProtectionNews } from './civilProtectionNews';
import { ukrainianArticle } from './civilProtectionUkrainian';
import { getOperationalNews, sourceFingerprint, type OperationalSource } from './operationalNews';
import { getTrailPolicyNews } from './trailPolicyNews';
import { newsCategories, type NewsCategory, type SiteNewsArticle } from './newsTypes';
import { readCache, writeCache } from './events/cache';
import { baseNewsId, classifyNews, mergeNewsLedger, type ManagedNews, type NewsLedger } from './newsLifecycle';
import { translateNewsText } from './newsTranslation';
import type { Locale } from './i18n/config';
import { newsText } from './i18n/newsText';
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
  const [civil, operational, policy, saved] = await Promise.all([getCivilProtectionNews(), getOperationalNews(), getTrailPolicyNews(), readCache<NewsLedger>(ledgerKey)]);
  const incoming: OperationalSource[] = [...operational, ...policy, ...civil.articles.map(item => ({ ...item, sourceName: 'SRPC — Цивільний захист Мадейри', checkedAt: civil.checkedAt, stale: civil.stale, categories: ['general'] as NewsCategory[], location: 'Мадейра', period: null }))];
  const initial = { latest: seed.articles as OperationalSource[], revisions: [] };
  const ledger = mergeNewsLedger(saved ?? initial, incoming);
  await writeCache(ledgerKey, ledger);
  const articles = [...classifyNews(ledger.latest), ...ledger.revisions].sort((a, b) => (b.sortDate ?? '').localeCompare(a.sortDate ?? '') || a.id.localeCompare(b.id));
  return { articles };
}
export function getNewsSources() {
  return pending ??= refreshSources().finally(() => { pending = null; });
}
export async function localizeNews(source: ManagedNews, full = true, locale: Locale = 'uk'): Promise<SiteNewsArticle> {
  const edited = editedOperational(source);
  let base: SiteNewsArticle = edited ?? { ...source, contentLanguage: 'pt', translationKind: 'original' };
  if (locale === 'uk' && !edited) {
    const ukrainian = await ukrainianArticle({ ...source, id: baseNewsId(source.id), publishedAt: source.publishedAt ?? '' }, full);
    if (ukrainian.contentLanguage === 'uk') base = { ...source, ...ukrainian, id: source.id, publishedAt: source.publishedAt };
  }
  const paragraphs = full ? base.paragraphs : [base.paragraphs.find(value => value.length > 80) ?? base.paragraphs[0] ?? ''];
  const translated = await Promise.all([base.title, ...paragraphs].map(value => translateNewsText(value, base.contentLanguage, locale)));
  const contentOK = translated.every(value => value !== null);
  const meta = async (value: string | null | undefined) => value ? await translateNewsText(value, /[а-яА-ЯіІїЇєЄ]/.test(value) ? 'uk' : 'pt', locale) : null;
  const [location, period, sourceName, archiveReason] = await Promise.all([meta(base.location), meta(base.period), meta(source.sourceName), meta(source.archiveReason)]);
  // Never label Portuguese fallback content as translated, or mix partial paragraph translations.
  return { ...base, ...(contentOK ? { title: translated[0]!, paragraphs: translated.slice(1) as string[], contentLanguage: locale, translationKind: base.contentLanguage === locale ? base.translationKind : 'machine' as const } : { title: source.title, paragraphs: full ? source.paragraphs : [source.paragraphs[0] ?? ''], contentLanguage: 'pt' as const, translationKind: 'original' as const }), location: location ?? newsText(locale).madeira, period, sourceName: sourceName ?? new URL(source.sourceUrl).hostname, archiveReason: archiveReason ?? (source.newsState === 'archived' ? newsText(locale).archived : source.newsState === 'unverified' ? newsText(locale).unverified : null) };
}
export async function getSiteNews(locale: Locale = 'uk') {
  const source = await getNewsSources();
  return { articles: await Promise.all(source.articles.map(item => localizeNews(item, false, locale))) };
}
