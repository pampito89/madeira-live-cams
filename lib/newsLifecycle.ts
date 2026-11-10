import rules from '../data/news-lifecycle-rules.json';
import { sourceFingerprint, type OperationalSource } from './operationalNews';
import type { NewsLifecycle } from './newsTypes';

export type ManagedNews = OperationalSource & NewsLifecycle;
export type NewsLedger = { latest: OperationalSource[]; revisions: ManagedNews[] };
const day = 86400000;
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const months = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
export const baseNewsId = (id: string) => id.replace(/-v-[a-f0-9]{12}$/, '');
export function noticeDay(item: OperationalSource): string | null {
  if (item.id === 'dre-status' || !closed(item)) return null;
  const text = normalize(item.paragraphs.join(' '));
  // Start dates and estimated durations are not end dates, even when they contain "no dia".
  if (/a partir|desde|prazo|duracao|inicio|inicia|periodo minimo|\d+ dias|prevista.*conclusao|ate ao dia|entre os dias/.test(text)) return null;
  const matches = Array.from(text.matchAll(/\bno dia (\d{1,2}) de ([a-z]+) (?:de )?(\d{4})\b/g));
  if (matches.length !== 1) return null;
  const [, d, month, year] = matches[0];
  const m = months.indexOf(month);
  if (m < 0) return null;
  const iso = `${year}-${String(m + 1).padStart(2, '0')}-${d.padStart(2, '0')}`;
  const parsed = Date.parse(`${iso}T12:00:00Z`);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === iso ? iso : null;
}
function localDay(now: number): string {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Atlantic/Madeira', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  return ['year','month','day'].map(type => parts.find(part => part.type === type)!.value).join('-');
}
function closed(item: OperationalSource) {
  const title = normalize(item.title);
  if (/prevencao|mitigacao/.test(title) && !/encerr|interdit|condicion/.test(title)) return false;
  return /encerrad|encerramento|interdit|condicionad|condicionamento|derrocada|desabamento/.test(title);
}
function reopened(item: OperationalSource) {
  const title = normalize(item.title);
  const body = normalize(item.paragraphs.join(' '));
  return /reabert|reabri|restabelecid[oa].*(?:circulacao|transito)/.test(title)
    && !/parcial|parcialmente|apenas|exceto|excepto|mantem.se.*encerr|continua.*encerr|previs|previst|sera reabert|podera|vai reabrir|nao.*reabert/.test(`${title} ${body}`)
    && /foi reabert|foram reabert|encontra.se abert|encontram.se abert|ja.*reabert|reabriu|reabriram|circulacao.*restabelecida|transito.*restabelecido/.test(body);
}
function entity(item: OperationalSource): string | null {
  const title = normalize(item.title);
  const codes = Array.from(title.matchAll(/\b(pr|er)\s*(\d+(?:\.\d+)?)/g)).map(match => `${match[1]}${match[2]}`);
  if (codes.length !== 1) return null;
  const text = normalize(item.paragraphs.join(' '));
  const section = text.match(/\bentre ([^.\n]+?)(?:\.|$)/)?.[1]?.replace(/[;:,].*$/, '').trim();
  if (codes[0].startsWith('er')) return section ? `${codes[0]}:${section}` : null;
  if (/troco|segmento|parcial/.test(`${title} ${text}`)) return section ? `${codes[0]}:${section}` : null;
  return codes[0];
}
export function mergeNewsLedger(previous: NewsLedger, incoming: OperationalSource[]): NewsLedger {
  const latest = new Map(previous.latest.map(item => [item.id, { ...item, stale: true }]));
  const revisions = new Map(previous.revisions.map(item => [item.id, item]));
  for (const item of incoming) {
    const old = latest.get(item.id);
    if (old && sourceFingerprint(old) !== sourceFingerprint(item)) {
      if (item.stale || Date.parse(item.checkedAt) < Date.parse(old.checkedAt)) continue;
      const id = `${item.id}-v-${sourceFingerprint(old).slice(0, 12)}`;
      revisions.set(id, { ...old, id, newsState: 'archived', archiveReason: 'Джерело опублікувало нову редакцію.', replacementId: item.id, sortDate: old.publishedAt ?? noticeDay(old) });
    }
    latest.set(item.id, item);
  }
  return { latest: Array.from(latest.values()), revisions: Array.from(revisions.values()) };
}
export function classifyNews(items: OperationalSource[], now = Date.now()): ManagedNews[] {
  return items.map(item => {
    const date = noticeDay(item);
    const rule = (rules as Record<string, { fingerprint: string; endsOn: string }>)[item.id];
    const endsOn = rule && rule.fingerprint === sourceFingerprint(item) ? rule.endsOn : date;
    const result: ManagedNews = { ...item, newsState: 'current', archiveReason: null, replacementId: null, sortDate: item.publishedAt ?? date };
    const key = closed(item) ? entity(item) : null;
    const replacement = key && item.publishedAt ? items.filter(next => next.id !== item.id && !next.stale && next.publishedAt && Date.parse(next.publishedAt) <= now && Date.parse(next.publishedAt) > Date.parse(item.publishedAt!) && new URL(next.sourceUrl).hostname === new URL(item.sourceUrl).hostname && entity(next) === key && reopened(next)).sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))[0] : null;
    if (replacement) return { ...result, newsState: 'archived' as const, archiveReason: 'Нове повідомлення підтверджує відновлення руху.', replacementId: replacement.id };
    if (endsOn && endsOn < localDay(now)) return { ...result, newsState: 'archived' as const, archiveReason: 'Зазначений у повідомленні період минув. Це не підтверджує відкриття.' };
    const age = item.publishedAt ? now - Date.parse(item.publishedAt) : 0;
    const weather = !item.id.startsWith('ifcn-') && !item.id.startsWith('dre-') && /aviso|meteorolog|depressao|medidas preventivas/.test(normalize(item.title));
    if (item.id !== 'dre-status' && !closed(item) && age > (weather ? 7 : 30) * day) return { ...result, newsState: 'archived' as const, archiveReason: weather ? 'Попереднє погодне повідомлення. Поточні умови дивіться в нових публікаціях.' : 'Історична публікація, старша за 30 днів.' };
    if (item.stale || now - Date.parse(item.checkedAt) > 2 * day || (closed(item) && age > 90 * day)) return { ...result, newsState: 'unverified' as const, archiveReason: 'Актуальність обмеження потребує підтвердження.' };
    return result;
  }).sort((a, b) => (b.sortDate ?? '').localeCompare(a.sortDate ?? '') || a.id.localeCompare(b.id));
}
