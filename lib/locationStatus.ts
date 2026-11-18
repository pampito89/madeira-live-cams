export const IFCN_STATUS_URL = 'https://ifcn.madeira.gov.pt/pt/atividades-de-natureza/percursos-pedestres-recomendados/percursos-pedestres-recomendados.html';
export const STATUS_MAX_AGE = 5 * 60_000;
export type LocationState = 'open' | 'closed' | 'restricted' | 'maintenance' | 'unknown';
export type LocationStatus = { state: LocationState; checkedAt: string; source: string; detail: string };
export type LocationStatusFeed = { checkedAt: string; statuses: Record<string, LocationStatus> };
// Match route identities explicitly. PR7 (Porto Moniz) is NOT Levada do Moinho in Ponta do Sol.
// A nearby route's status must never be applied to a viewpoint, forest, road or summit access.
export const locationTrailIds: Record<string, string> = {
  'pico-do-arieiro': '1', 'pico-ruivo': '1.2', 'ponta-de-sao-lourenco': '8',
  'pr9-levada-do-caldeirao-verde': '9', 'pico-grande': '12', 'pr6-25-fontes': '6',
  'pr6-levada-do-risco': '6.1', 'pr6-2-levada-do-alecrim': '6.2',
  'pr11-vereda-dos-balcoes': '11', 'pr18-levada-do-rei': '18', 'pr14-levada-dos-cedros': '14',
  'pr13-vereda-do-fanal': '13', 'pr5-vereda-das-funduras': '5', 'pr17-pinaculo-folhadal': '17',
  'levada-do-furado': '10',
};
export function freshStatus(value: LocationStatus | undefined, now = Date.now()): LocationStatus | undefined {
  if (!value || !['open', 'closed', 'restricted', 'maintenance', 'unknown'].includes(value.state)) return;
  const age = now - Date.parse(value.checkedAt);
  if (!Number.isFinite(age) || age < 0 || age >= STATUS_MAX_AGE || value.source !== IFCN_STATUS_URL || typeof value.detail !== 'string') return;
  return value;
}
function plainText(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/\s+/g, ' ').trim();
}
export function classifyTrailState(text: string): LocationState {
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  if (/\b(OBRAS|MANUTENCAO|MAINTENANCE|REPAIR)\b/.test(normalized)) return 'maintenance';
  if (/PARCIAL|PARTIAL|CONDICION|RESTRICT|CIRCULACAO CONTROLADA|UNICO SENTIDO|TRANSITAVEL/.test(normalized)) return 'restricted';
  if (/\b(ENCERRADO|CLOSED)\b/.test(normalized)) return 'closed';
  // Additional unrecognised qualifications must not silently become an unrestricted green status.
  if (/^(ABERTO|OPEN)(\s*\/\s*(ABERTO|OPEN))?[.!]?$/.test(normalized)) return 'open';
  return 'unknown';
}
export function parseIfcnStatuses(html: string, checkedAt = new Date().toISOString()): LocationStatusFeed {
  const tables = html.match(/<table\b[^>]*>[\s\S]*?<\/table>/gi) ?? [];
  // The second island table reuses PR1/PR2/PR3. Select by the unique Areeiro route name.
  const table = tables.find(value => /Vereda do Areeiro/i.test(plainText(value)) && /ESTADO/i.test(value));
  if (!table) throw new Error('IFCN route table unavailable');
  const routes: Record<string, { state: LocationState; detail: string }> = {};
  for (const row of table.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) ?? []) {
    const cells = (row.match(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi) ?? []).map(plainText);
    if (cells.length !== 7 || !/^\d+(?:\.\d+)?$/.test(cells[1])) continue;
    if (routes[cells[1]]) throw new Error('Ambiguous IFCN route identity');
    routes[cells[1]] = { state: classifyTrailState(cells[5]), detail: `PR${cells[1]}: ${cells[5]}`.slice(0, 700) };
  }
  if (Object.keys(routes).length < 10 || !routes['1'] || !routes['1.2']) throw new Error('Incomplete IFCN route table');
  const statuses: Record<string, LocationStatus> = {};
  for (const [slug, routeId] of Object.entries(locationTrailIds)) {
    if (routes[routeId]) statuses[slug] = { ...routes[routeId], checkedAt, source: IFCN_STATUS_URL };
  }
  return { checkedAt, statuses };
}
