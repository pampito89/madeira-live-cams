import { useEffect, useState } from 'react';
import { assessAirportWeather, type AirportWeather, type WeatherLevel } from '../lib/airportWeather';
import { airportWeatherText } from '../lib/i18n/airportWeather';
import type { Locale } from '../lib/i18n/config';
const colours: Record<WeatherLevel, string> = { green: 'text-emerald-700', yellow: 'text-amber-700', red: 'text-red-700', unknown: 'text-slate-500' };
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
      const request = new AbortController();
      controller = request;
      const timer = window.setTimeout(() => request.abort(), 15_000);
      try {
        const response = await fetch('/api/airport-weather', { signal: request.signal });
        if (!response.ok) throw new Error('Unavailable');
        const next: AirportWeather = await response.json();
        if (!Number.isFinite(Date.parse(next.observedAt))) throw new Error('Invalid observation');
        if (!disposed) setData(next);
      } catch { if (!disposed) setData(null); }
      finally { window.clearTimeout(timer); controller = null; if (!disposed) { setLoading(false); setNow(Date.now()); } }
    }
    void load();
    const update = () => { setNow(Date.now()); if (document.visibilityState === 'visible' && Date.now() - lastAttempt >= 300_000) void load(); };
    const timer = window.setInterval(update, 30_000);
    document.addEventListener('visibilitychange', update);
    return () => { disposed = true; controller?.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, []);
  const assessment = data ? assessAirportWeather(data, now) : { level: 'unknown' as const, reasons: [] };
  const decimal = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
  const speed = (value: number | null | undefined) => value == null ? '—' : `${Math.round(value * 1.852)} ${text.speedUnit}`;
  const observed = data ? new Intl.DateTimeFormat(locale, { timeZone: 'Atlantic/Madeira', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(data.observedAt)) : '';
  return <aside aria-labelledby="airport-weather-title" className="min-w-0 self-start rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <h2 id="airport-weather-title" className="text-base font-semibold text-navy">{text.heading} <span className="text-xs font-normal text-slate-500">FNC</span></h2>
    <p role="status" aria-live="polite" className={`mt-2 flex items-center gap-2 text-xs font-medium ${colours[assessment.level]}`}><span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-current" />{loading ? text.loading : data ? text.levels[assessment.level] : text.unavailable}</p>
    {data ? <>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        {[[text.wind, speed(data.windKnots)], [text.gusts, speed(data.gustKnots)], [text.visibility, data.visibilityKm === null ? '—' : `${data.visibilityAtLeast ? '≥ ' : ''}${decimal(data.visibilityKm)} ${text.distanceUnit}`], [text.temperature, data.temperature === null ? '—' : `${decimal(data.temperature)} °C`]].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="font-semibold text-navy">{value}</dd></div>)}
      </dl>
      <p className="mt-3 text-xs text-slate-500"><time dateTime={data.observedAt}>{observed}</time> · <a href="https://aviationweather.gov/data/metar/?id=LPMA" target="_blank" rel="noopener noreferrer" className="underline">METAR LPMA</a></p>
    </> : null}
  </aside>;
}
