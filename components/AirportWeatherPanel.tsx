import { useEffect, useState } from 'react';
import { assessAirportWeather, type AirportWeather, type WeatherLevel } from '../lib/airportWeather';
import { airportWeatherText } from '../lib/i18n/airportWeather';
import type { Locale } from '../lib/i18n/config';

const colours: Record<WeatherLevel, string> = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  yellow: 'border-amber-200 bg-amber-50 text-amber-950',
  red: 'border-red-200 bg-red-50 text-red-950',
  unknown: 'border-slate-200 bg-slate-100 text-slate-700',
};
export default function AirportWeatherPanel({ locale }: { locale: Locale }) {
  const text = airportWeatherText(locale);
  const [data, setData] = useState<AirportWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  useEffect(() => {
    let disposed = false;
    let controller: AbortController | null = null;
    let lastAttempt = 0;
    async function load() {
      if (controller || Date.now() - lastAttempt < 60_000) return;
      lastAttempt = Date.now();
      controller = new AbortController();
      const timer = window.setTimeout(() => controller?.abort(), 15_000);
      try {
        const response = await fetch('/api/airport-weather', { signal: controller.signal });
        if (!response.ok) throw new Error('Unavailable');
        const next: AirportWeather = await response.json();
        if (!Number.isFinite(Date.parse(next.observedAt))) throw new Error('Invalid observation');
        if (!disposed) setData(next);
      } catch { if (!disposed) setData(null); }
      finally {
        window.clearTimeout(timer); controller = null;
        if (!disposed) { setLoading(false); setNow(Date.now()); }
      }
    }
    void load();
    const timer = window.setInterval(() => {
      setNow(Date.now());
      if (document.visibilityState === 'visible' && Date.now() - lastAttempt >= 300_000) void load();
    }, 30_000);
    const visible = () => { if (document.visibilityState === 'visible') { setNow(Date.now()); if (Date.now() - lastAttempt >= 300_000) void load(); } };
    document.addEventListener('visibilitychange', visible);
    return () => { disposed = true; controller?.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', visible); };
  }, []);
  const assessment = data ? assessAirportWeather(data, now) : { level: 'unknown' as const, reasons: [] };
  const decimal = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
  const speed = (value: number | null | undefined) => value == null ? text.unreported : `${Math.round(value * 1.852)} ${text.speedUnit}`;
  const observed = data ? new Intl.DateTimeFormat(locale, { timeZone: 'Atlantic/Madeira', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(data.observedAt)) : '';
  return (
    <aside aria-labelledby="airport-weather-title" className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="airport-weather-title" className="text-lg font-semibold text-navy">{text.heading}</h2>
        <span className="rounded bg-panel px-2 py-1 text-xs font-semibold text-slate-600">FNC · LPMA</span>
      </div>
      <div role="status" aria-live="polite" className={`mt-4 rounded-lg border p-3 ${colours[assessment.level]}`}>
        <p className="flex items-start gap-2 text-sm font-semibold"><span aria-hidden="true" className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-current" />{loading ? text.loading : data ? text.levels[assessment.level] : text.unavailable}</p>
        {data ? <p className="mt-1 text-xs leading-5">{assessment.reasons.length ? assessment.reasons.map(reason => text.reasons[reason]).join(' · ') : text.calm}</p> : null}
      </div>
      {data ? <>
        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
          {[
            [text.wind, speed(data.windKnots)], [text.gusts, speed(data.gustKnots)],
            [text.visibility, data.visibilityKm === null ? text.unreported : `${data.visibilityAtLeast ? '≥ ' : ''}${decimal(data.visibilityKm)} ${text.distanceUnit}`],
            [text.temperature, data.temperature === null ? text.unreported : `${decimal(data.temperature)} °C`],
            [text.direction, data.direction === 'VRB' ? text.variable : data.direction === null ? text.unreported : `${data.direction}°`],
          ].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-navy">{value}</dd></div>)}
        </dl>
        <p className="mt-4 text-xs leading-5 text-slate-500">{text.observed}: <time dateTime={data.observedAt}>{observed}</time><br />{text.refreshNote}</p>
      </> : null}
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-600">{text.disclaimer}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-ocean">
        <a href="https://www.madeiraairport.pt/en/fnc/home" target="_blank" rel="noopener noreferrer" className="underline">{text.official} ↗</a>
        <a href="#airport-flights" className="underline">{text.flights} ↓</a>
      </div>
      <details className="mt-4 text-xs leading-5 text-slate-500">
        <summary className="cursor-pointer font-medium text-slate-600">{text.explanation}</summary>
        <p className="mt-2">{text.thresholds}</p>
        <a href="https://aviationweather.gov/data/metar/?id=LPMA" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block underline">NOAA Aviation Weather Center · METAR LPMA ↗</a>
        {data?.raw ? <><p className="mt-2 font-medium">{text.raw}</p><code className="mt-1 block break-words rounded bg-panel p-2">{data.raw}</code></> : null}
      </details>
    </aside>
  );
}
