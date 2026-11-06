import { useEffect, useState } from 'react';
import type { AirportUpdates } from '../lib/airportUpdates';
import { airportUpdatesText } from '../lib/i18n/airportUpdates';
import { airportTimelineText } from '../lib/i18n/airportTimeline';
import type { Locale } from '../lib/i18n/config';

const hour = 3_600_000;
const types = ['Trovoada', 'Agitação Marítima', 'Precipitação', 'Vento', 'Neve', 'Tempo Frio', 'Tempo Quente', 'Nevoeiro'];
const colors = { yellow: 'bg-yellow-300 text-slate-900', orange: 'bg-orange-500 text-slate-950', red: 'bg-red-700 text-white' };
const severity = { yellow: 1, orange: 2, red: 3 };

export default function AirportWarningTimeline({ locale }: { locale: Locale }) {
  const text = airportTimelineText(locale);
  const updates = airportUpdatesText(locale);
  const [data, setData] = useState<AirportUpdates | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let stopped = false;
    let active: AbortController | null = null;
    async function load() {
      if (active) return;
      const controller = new AbortController();
      active = controller;
      const timeout = window.setTimeout(() => controller.abort(), 12_000);
      try {
        const response = await fetch('/api/airport-updates', { signal: controller.signal });
        if (!response.ok) throw new Error('Unavailable');
        const result: AirportUpdates = await response.json();
        if (!result.warningsAvailable || !Array.isArray(result.warnings) || !Number.isFinite(Date.parse(result.fetchedAt))) throw new Error('Unavailable');
        if (!stopped) setData(result);
      } catch {
        if (!stopped) setData(null);
      } finally {
        window.clearTimeout(timeout);
        active = null;
        if (!stopped) { setLoading(false); setNow(Date.now()); }
      }
    }
    void load();
    const refresh = () => { setNow(Date.now()); if (!document.hidden) void load(); };
    const timer = window.setInterval(refresh, 300_000);
    document.addEventListener('visibilitychange', refresh);
    return () => { stopped = true; active?.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, []);

  const available = data && now - Date.parse(data.fetchedAt) < 900_000 && Date.parse(data.fetchedAt) <= now + 60_000;
  const start = data ? Date.parse(data.fetchedAt) : 0;
  const end = start + 72 * hour;
  const format = (value: number) => new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(value);
  const dateLabel = (value: number) => new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: 'short' }).format(value);
  const hourLabel = (value: number) => new Intl.DateTimeFormat(locale, { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(value);
  const warnings = available ? data.warnings.filter(w => Date.parse(w.end) > now && Date.parse(w.start) < end && Date.parse(w.end) > Date.parse(w.start)).sort((a, b) => severity[a.level] - severity[b.level]) : [];
  const rows = Array.from(new Set([...types, ...warnings.map(w => w.type)]));
  // Use whole UTC hours for the axis, preserving exact source times for the bars.
  const firstTick = Math.ceil(start / (6 * hour)) * 6 * hour;
  const ticks = Array.from({ length: 12 }, (_, i) => firstTick + i * 6 * hour).filter(tick => tick < end);
  const position = (value: number) => (value - start) / (end - start) * 100;

  return <section aria-labelledby="airport-timeline-title" className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <h2 id="airport-timeline-title" className="text-base font-semibold text-navy">{text.heading}</h2>
    <p className="mt-1 text-xs text-slate-600">{text.scope}</p>
    <p className="mt-2 text-xs font-medium text-slate-600">{text.period}</p>
    {!available ? <p role="status" className="mt-3 text-sm text-slate-500">{loading ? updates.loading : updates.unavailable}</p> : <>
      <p className="mt-1 text-xs text-slate-500">{updates.checked}: <time dateTime={data.fetchedAt}>{format(start)} UTC</time></p>
      <p id="airport-timeline-scroll" className="mt-3 text-xs text-slate-500">{text.scroll}</p>
      <div role="region" aria-label={text.heading} aria-describedby="airport-timeline-scroll" tabIndex={0} className="mt-2 overflow-x-auto rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean">
        <div className="min-w-[680px] px-5 py-2">
          <div aria-hidden="true" className="relative ml-28 h-10 text-[10px] text-slate-600">
            {ticks.map(tick => <span key={tick} className="absolute bottom-1 -translate-x-1/2 text-center" style={{ left: `${position(tick)}%` }}>{new Date(tick).getUTCHours() % 12 === 0 ? <span className="block whitespace-nowrap">{dateLabel(tick)}</span> : null}<span className="block">{hourLabel(tick)}</span></span>)}
          </div>
          {rows.map(type => <div key={type} className="flex items-center border-t border-white py-1">
            <span className="sticky left-0 z-10 w-28 shrink-0 bg-white pr-2 text-xs font-medium text-slate-700">{updates.type(type)}</span>
            <div role="img" aria-label={`${updates.type(type)}: ${warnings.filter(w => w.type === type).map(w => `${updates.level(w.level)} ${format(Date.parse(w.start))} – ${format(Date.parse(w.end))} UTC`).join('; ') || text.green}`} className="relative h-7 flex-1 overflow-hidden rounded bg-emerald-200">
              {ticks.map(tick => <span key={tick} aria-hidden="true" className="absolute inset-y-0 border-l border-emerald-800/20" style={{ left: `${position(tick)}%` }} />)}
              {warnings.filter(w => w.type === type).map(w => {
                const left = Math.max(start, Date.parse(w.start));
                const right = Math.min(end, Date.parse(w.end));
                const label = `${updates.type(type)} · ${updates.level(w.level)} · ${format(Date.parse(w.start))} – ${format(Date.parse(w.end))} UTC`;
                return <span key={`${w.type}:${w.level}:${w.start}:${w.end}`} title={label} aria-hidden="true" className={`absolute inset-y-0 flex items-center justify-center overflow-hidden border-x border-black/20 text-xs font-bold ${colors[w.level]}`} style={{ left: `${position(left)}%`, width: `${(right - left) / (end - start) * 100}%` }}>!</span>;
              })}
            </div>
          </div>)}
        </div>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-xs text-slate-700" aria-label={text.heading}>
        <li className="flex items-center gap-1"><span aria-hidden="true" className="h-3 w-3 rounded-sm bg-emerald-200" />{text.green}</li>
        {(['yellow', 'orange', 'red'] as const).map(level => <li key={level} className="flex items-center gap-1"><span aria-hidden="true" className={`h-3 w-3 rounded-sm ${colors[level]}`} />{updates.level(level)}</li>)}
      </ul>
      {warnings.length ? <details className="mt-3 text-xs text-slate-600"><summary className="cursor-pointer py-1 font-medium text-ocean">{updates.weather}</summary><ul className="mt-2 space-y-2">{warnings.map(w => <li key={`${w.type}:${w.level}:${w.start}:${w.end}`}><strong>{updates.type(w.type)} · {updates.level(w.level)}</strong><br />{format(Date.parse(w.start))} – {format(Date.parse(w.end))} UTC</li>)}</ul></details> : null}
    </>}
    <a href="https://www.ipma.pt/en/otempo/prev-sam?p=MCS" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs text-ocean underline">IPMA · {updates.weather} ↗</a>
  </section>;
}
