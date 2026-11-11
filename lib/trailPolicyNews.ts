import { createHash } from 'node:crypto';
import { newsParagraphs } from './civilProtectionNews';
import { readCache, writeCache } from './events/cache';
import type { OperationalSource } from './operationalNews';
import seed from '../data/trail-policy-seed.json';

export const TRAIL_POLICY_HOME = 'https://madeira.rtp.pt/sociedade/';
const key = 'trail-policy-news:v1';
type Store = { checkedAt: string; articles: OperationalSource[] };
let memory: Store | null = null;
let pending: Promise<OperationalSource[]> | null = null;
let retryAt = 0;
export function allowedTrailPolicyUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'madeira.rtp.pt' && !url.port && !url.username && !url.password && !url.search && !url.hash && /^\/sociedade\/[a-z0-9-]+\/$/.test(url.pathname);
  } catch { return false; }
}
export function policyTopic(value: string) {
  const text = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return /percurs|trilh|levada|vereda/.test(text) && /taxa|prec[oa]|reserv|bilhet|acesso|regras|regime/.test(text);
}
export function discoverTrailPolicies(html: string) {
  const urls = new Set<string>();
  for (const match of Array.from(html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi))) {
    try {
      const url = new URL(match[1], TRAIL_POLICY_HOME).href;
      if (allowedTrailPolicyUrl(url) && policyTopic(`${new URL(url).pathname} ${newsParagraphs(match[2]).join(' ')}`)) urls.add(url);
    } catch { /* Ignore unrelated links. */ }
  }
  return Array.from(urls).slice(0, 12);
}
export function parseTrailPolicy(html: string, sourceUrl: string, checkedAt: string): OperationalSource {
  if (!allowedTrailPolicyUrl(sourceUrl)) throw new Error('Unapproved policy source');
  const extract = (tag: string, cls: string) => newsParagraphs(html.match(new RegExp(`<${tag}\\b[^>]*class=["'][^"']*\\b${cls}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1] ?? '').join(' ');
  const title = extract('h1', 'main-article-title');
  const lead = extract('p', 'main-article-lead');
  const rawDate = extract('span', 'main-article-date-info');
  const date = rawDate.match(/(\d{1,2})\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez),?\s+(\d{4})/i);
  if (!policyTopic(title) || !lead || !date) throw new Error('Missing policy article fields');
  const month = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'].indexOf(date[2].toLowerCase()) + 1;
  const publishedAt = `${date[3]}-${String(month).padStart(2, '0')}-${date[1].padStart(2, '0')}`;
  if (!Number.isFinite(Date.parse(publishedAt)) || new Date(publishedAt).toISOString().slice(0, 10) !== publishedAt) throw new Error('Invalid publication date');
  // Only the short publisher lead, never the full media article or its photos.
  const excerpt = lead.length <= 400 ? lead : `${lead.slice(0, 397).replace(/\s+\S*$/, '')}…`;
  return { id: `rtp-${createHash('sha256').update(sourceUrl).digest('hex').slice(0, 12)}`, title, paragraphs: [excerpt], sourceUrl, sourceName: 'RTP Madeira — тарифи та правила маршрутів', publishedAt, checkedAt, stale: false, categories: ['trails'], location: 'Мадейра', period: null };
}
async function fetchHtml(url: string) {
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Policy source unavailable');
  const html = await response.text();
  if (html.length > 3_000_000) throw new Error('Policy source too large');
  return html;
}
async function refresh(): Promise<OperationalSource[]> {
  const previous = memory ?? await readCache<Store>(key) ?? seed as Store;
  if (Date.now() < retryAt) return previous.articles.map(item => ({ ...item, stale: true }));
  if (memory && Date.now() - Date.parse(memory.checkedAt) < 600_000) return memory.articles;
  try {
    const checkedAt = new Date().toISOString();
    const urls = new Set([...discoverTrailPolicies(await fetchHtml(TRAIL_POLICY_HOME)), ...previous.articles.slice(0, 12).map(item => item.sourceUrl).filter(allowedTrailPolicyUrl)]);
    const results = await Promise.allSettled(Array.from(urls).map(async url => parseTrailPolicy(await fetchHtml(url), url, checkedAt)));
    const current = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
    if (!current.length) throw new Error('No policy news');
    const merged = new Map(previous.articles.map(item => [item.id, { ...item, stale: true }]));
    current.forEach(item => merged.set(item.id, item));
    memory = { checkedAt, articles: Array.from(merged.values()) };
    await writeCache(key, memory);
    return memory.articles;
  } catch {
    retryAt = Date.now() + 60_000;
    return previous.articles.map(item => ({ ...item, stale: true }));
  }
}
export function getTrailPolicyNews() {
  return pending ??= refresh().finally(() => { pending = null; });
}
