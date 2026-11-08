import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { readCache, writeCache } from './events/cache';
import { newsParagraphs } from './civilProtectionNews';
import type { NewsCategory } from './newsTypes';

export const IFCN_HOME = 'https://ifcn.madeira.gov.pt/pt/';
export const DRE_HOME = 'https://www.madeira.gov.pt/drestradas/';
export const ROAD_STATUS = 'https://www.madeira.gov.pt/srtc/Pesquisar/ctl/ReadInformcao/mid/5346/InformacaoId/136562/UnidadeOrganicaId/52';
export type OperationalSource = { id: string; title: string; paragraphs: string[]; sourceUrl: string; sourceName: string; publishedAt: string | null; checkedAt: string; stale: boolean; categories: NewsCategory[]; location: string; period: string | null };
type Store = { checkedAt: string; articles: OperationalSource[] };
const CACHE_KEY = 'operational-news:v1';
let memory: Store | null = null;
let pending: Promise<OperationalSource[]> | null = null;
let retryAt = 0;

const text = (html: string) => newsParagraphs(html.replace(/&ndash;/g, '–').replace(/&mdash;/g, '—').replace(/&ordf;/g, 'ª').replace(/&[lr]aquo;/g, '"')).join(' ');
export function sourceFingerprint(article: { title: string; paragraphs: string[] }) {
  return createHash('sha256').update(JSON.stringify([article.title, article.paragraphs])).digest('hex');
}
export function allowedOperationalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
    if (url.hostname === 'ifcn.madeira.gov.pt') return url.pathname === '/pt/' && url.searchParams.get('view') === 'article' && /^\d+(?::[\w-]+)?$/.test(url.searchParams.get('id') ?? '') && /^146(?::avisos)?$/.test(url.searchParams.get('catid') ?? '');
    return url.hostname === 'www.madeira.gov.pt' && (url.href === ROAD_STATUS || /^\/drestradas\/Estrutura\/DRE\/ctl\/Read\/mid\/\d+\/InformacaoId\/\d+\/UnidadeOrganicaId\/22$/.test(url.pathname));
  } catch { return false; }
}
// Balanced extraction supports nested DIV/SPAN wrappers without including sidebars.
export function elementBody(html: string, opening: RegExp): string {
  const match = opening.exec(html);
  if (!match) throw new Error('Official article structure changed');
  const tag = match[0].match(/^<(\w+)/)?.[1];
  const start = match.index + match[0].length;
  const tags = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
  tags.lastIndex = start;
  let depth = 1; let next;
  while ((next = tags.exec(html))) {
    depth += next[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(start, next.index);
  }
  throw new Error('Unclosed article');
}
export function discoverNotices(html: string, source: 'ifcn' | 'dre'): string[] {
  const links = new Map<string, string>();
  for (const match of Array.from(html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi))) {
    const label = text(match[2]);
    if (!/encerr|condicion|reabert|requalifica|derroc|conclu[ií]d|pavimento|obras/i.test(label) || /TEMPORARY|CLOSURE|REOPEN/i.test(label)) continue;
    try {
      const url = new URL(match[1].replace(/&amp;/g, '&'), source === 'ifcn' ? IFCN_HOME : DRE_HOME);
      if (!allowedOperationalUrl(url.href)) continue;
      const id = source === 'ifcn' ? url.searchParams.get('id')!.split(':')[0] : url.pathname.match(/InformacaoId\/(\d+)/)![1];
      links.set(id, url.href);
    } catch { /* Skip unrelated links. */ }
  }
  return Array.from(links.values()).slice(0, 12);
}
function dateOnly(day: string, month: string, year: string): string | null {
  const value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  return Number.isFinite(Date.parse(value)) ? value : null;
}
export function parseOperationalArticle(html: string, url: string, checkedAt: string): OperationalSource {
  if (!allowedOperationalUrl(url)) throw new Error('Non-official source');
  const ifcn = new URL(url).hostname === 'ifcn.madeira.gov.pt';
  const summary = url === ROAD_STATUS;
  const body = elementBody(html, ifcn ? /<div\b[^>]*class="astroid-article-text"[^>]*>/i : /<span\b[^>]*id="[^"]*_Conteudo_0"[^>]*>/i);
  const raw = summary ? body.slice(body.indexOf('Última Atualização'), body.indexOf('</table>') + 8) : body;
  if (summary && !raw.includes('ESTRADAS REGIONAIS')) throw new Error('Road summary structure changed');
  const paragraphs = newsParagraphs(raw.replace(/&ndash;/g, '–').replace(/&ordf;/g, 'ª'));
  if (!paragraphs.length || paragraphs.join('').length < 40) throw new Error('Empty official notice');
  const title = summary ? 'Informação de Estradas' : text(ifcn ? html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '' : elementBody(html, /<span\b[^>]*id="[^"]*_vcTitulo_0"[^>]*>/i));
  let publishedAt: string | null = null;
  if (!ifcn && !summary) {
    const date = html.match(/_vcDataPublicacao_0">(\d{2})-(\d{2})-(\d{4})/);
    if (date) publishedAt = dateOnly(date[1], date[2], date[3]);
  }
  if (summary) {
    const date = text(raw).match(/Última Atualização:\s*(\d{1,2})\s*(?:de\s*)?([a-zç]+)\s*(?:de\s*)?(\d{4})/i);
    const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    if (date && months.includes(date[2].toLowerCase())) publishedAt = dateOnly(date[1], String(months.indexOf(date[2].toLowerCase()) + 1), date[3]);
  }
  const id = ifcn ? `ifcn-${new URL(url).searchParams.get('id')!.split(':')[0]}` : summary ? 'dre-status' : `dre-${url.match(/InformacaoId\/(\d+)/)![1]}`;
  const combined = `${title} ${paragraphs.join(' ')}`;
  const categories: NewsCategory[] = ifcn && !/estrada florestal/i.test(title) ? ['trails'] : ['roads'];
  if (/desabamento|derrocada|queda de|inunda|movimentos de massa/i.test(combined)) categories.push('weather');
  // Category means an incident/impact, not proof that a named storm caused it.
  const location = Array.from(new Set(combined.match(/(?:PR|ER)\s*\d+(?:\.\d+)?/g) ?? [])).join(' · ') || 'Мадейра';
  return { id, title, paragraphs, sourceUrl: url, sourceName: ifcn ? 'IFCN — Інститут лісів та охорони природи' : summary ? 'Дорожня служба — зведення уряду Мадейри' : 'Direção Regional de Estradas', publishedAt, checkedAt, stale: false, categories, location, period: null };
}
async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(7000) });
  if (!response.ok) throw new Error('Official source unavailable');
  const html = await response.text();
  if (html.length > 12_000_000) throw new Error('Source too large');
  return html;
}
export async function importOperationalSources(): Promise<Store> {
  const checkedAt = new Date().toISOString();
  const homes = await Promise.allSettled([fetchHtml(IFCN_HOME), fetchHtml(DRE_HOME)]);
  const urls = [ROAD_STATUS];
  homes.forEach((result, index) => { if (result.status === 'fulfilled') urls.push(...discoverNotices(result.value, index === 0 ? 'ifcn' : 'dre')); });
  const results = await Promise.allSettled(urls.map(async url => parseOperationalArticle(await fetchHtml(url), url, checkedAt)));
  const articles = results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
  if (!articles.length) throw new Error('No operational sources');
  return { checkedAt, articles };
}
async function refresh(): Promise<OperationalSource[]> {
  const previous: Store = memory ?? await readCache<Store>(CACHE_KEY) ?? JSON.parse(await readFile(path.join(process.cwd(), 'data', 'operational-news-seed.json'), 'utf8'));
  if (Date.now() < retryAt) return previous.articles;
  if (memory && Date.now() - Date.parse(memory.checkedAt) < 10 * 60_000) return memory.articles;
  try {
    const current = await importOperationalSources();
    const merged = new Map(previous.articles.map(item => [item.id, { ...item, stale: true }]));
    current.articles.forEach(item => merged.set(item.id, item));
    memory = { checkedAt: current.checkedAt, articles: Array.from(merged.values()) };
    await writeCache(CACHE_KEY, memory);
    return memory.articles;
  } catch {
    retryAt = Date.now() + 60_000;
    memory = { ...previous, articles: previous.articles.map(item => ({ ...item, stale: true })) };
    return memory.articles;
  }
}
export function getOperationalNews() {
  return pending ??= refresh().finally(() => { pending = null; });
}
