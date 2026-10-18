export type WeatherLevel = 'green' | 'yellow' | 'red' | 'unknown';
export type WeatherReason = 'wind' | 'visibility' | 'cloud' | 'storm' | 'precipitation' | 'stale' | 'incomplete';
export type AirportWeather = {
  observedAt: string; fetchedAt: string; temperature: number | null;
  windKnots: number | null; gustKnots: number | null; direction: number | 'VRB' | null;
  visibilityKm: number | null; visibilityAtLeast: boolean;
  category: string | null; phenomena: string; raw: string;
};
const number = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : null;
export function normalizeAirportWeather(payload: unknown, now = Date.now()): AirportWeather {
  if (!Array.isArray(payload)) throw new Error('Invalid METAR response');
  const row = payload.filter(r => r && r.icaoId === 'LPMA' && typeof r.obsTime === 'number')
    .sort((a, b) => b.obsTime - a.obsTime)[0];
  if (!row || !Number.isFinite(row.obsTime) || row.obsTime <= 0) throw new Error('No LPMA observation');
  const raw = typeof row.rawOb === 'string' ? row.rawOb.slice(0, 1000) : '';
  // METAR 9999/CAVOK means visibility of at least 10 km. The JSON field is in statute miles.
  const metricLimit = /\b(?:9999|CAVOK)\b/.test(raw.split(/\b(?:TEMPO|BECMG|RMK)\b/)[0]);
  const visibilityText = String(row.visib ?? '');
  const miles = /^\d+(?:\.\d+)?\+?$/.test(visibilityText) ? Number.parseFloat(visibilityText) : null;
  return {
    observedAt: new Date(row.obsTime * 1000).toISOString(), fetchedAt: new Date(now).toISOString(),
    temperature: number(row.temp, -80, 60), windKnots: number(row.wspd, 0, 200), gustKnots: number(row.wgst, 0, 250),
    direction: row.wdir === 'VRB' ? 'VRB' : number(row.wdir, 0, 360),
    visibilityKm: metricLimit ? 10 : miles === null ? null : miles * 1.609344,
    visibilityAtLeast: metricLimit || visibilityText.endsWith('+'),
    category: ['VFR', 'MVFR', 'IFR', 'LIFR'].includes(row.fltCat) ? row.fltCat : null,
    phenomena: typeof row.wxString === 'string' ? row.wxString.slice(0, 120) : '', raw,
  };
}

// These are site display thresholds, NOT runway operating limits or a closure decision.
export function assessAirportWeather(data: AirportWeather, now = Date.now()): { level: WeatherLevel; reasons: WeatherReason[] } {
  const age = now - Date.parse(data.observedAt);
  if (!Number.isFinite(age) || age > 90 * 60_000 || age < -10 * 60_000) return { level: 'unknown', reasons: ['stale'] };
  if (data.windKnots === null || data.visibilityKm === null || data.category === null) return { level: 'unknown', reasons: ['incomplete'] };
  const reasons: WeatherReason[] = [];
  let severity = 0;
  const flag = (reason: WeatherReason, value: number) => { reasons.push(reason); severity = Math.max(severity, value); };
  if (data.windKnots >= 30 || (data.gustKnots ?? 0) >= 40) flag('wind', 2);
  else if (data.windKnots >= 20 || (data.gustKnots ?? 0) >= 30) flag('wind', 1);
  if (data.visibilityKm < 1) flag('visibility', 2);
  else if (data.visibilityKm < 5) flag('visibility', 1);
  if (data.category === 'IFR' || data.category === 'LIFR') flag('cloud', 2);
  else if (data.category === 'MVFR') flag('cloud', 1);
  if (/TS|FC|SQ|FZ/.test(data.phenomena)) flag('storm', 2);
  else if (/RA|SN|GR|GS|PL/.test(data.phenomena)) flag('precipitation', 1);
  return { level: severity === 2 ? 'red' : severity === 1 ? 'yellow' : 'green', reasons };
}
