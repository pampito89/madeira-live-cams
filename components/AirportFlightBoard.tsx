import { useEffect, useRef, useState } from 'react';
import type { FlightSnapshot } from '../lib/aviationstack';
import type { FlightDirection } from '../lib/airportFlights';
import { airportFlightText } from '../lib/i18n/airportFlights';
import { flightSnapshotText } from '../lib/i18n/flightSnapshot';
import type { Locale } from '../lib/i18n/config';

export default function AirportFlightBoard({ locale }: { locale: Locale }) {
  const text = airportFlightText(locale);
  const copy = flightSnapshotText(locale);
  const [data, setData] = useState<FlightSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(0);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => { const controller = active.current; active.current = null; controller?.abort(); }, []);
  useEffect(() => {
    if (!data) return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [data]);
  async function load() {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 60_000);
    setLoading(true); setFailed(false);
    try {
      const response = await fetch('/api/airport-flights', { method: 'POST', signal: controller.signal });
      if (!response.ok) throw new Error('Unavailable');
      const result: FlightSnapshot = await response.json();
      if (!Array.isArray(result.arrivals) || !Array.isArray(result.departures) || !Number.isFinite(Date.parse(result.fetchedAt)) || !Number.isFinite(Date.parse(result.nextRefreshAt))) throw new Error('Invalid data');
      if (active.current === controller) { setData(result); setNow(Date.now()); }
    } catch { if (active.current === controller) setFailed(true); }
    finally {
      window.clearTimeout(timeout);
      if (active.current === controller) { active.current = null; setLoading(false); }
    }
  }
  const format = (value: string | null) => value ? new Intl.DateTimeFormat(locale, { timeZone: 'Atlantic/Madeira', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(value)) : '—';
  const old = data && now - Date.parse(data.fetchedAt) > 60 * 60_000;
  return (
    <section id="airport-flights" aria-labelledby="airport-flights-heading" className="mt-8 min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 id="airport-flights-heading" className="text-xl font-semibold text-navy">{text.heading}</h2>
      <p className="mt-2 text-sm text-slate-600">{copy.intro}</p>
      <button type="button" onClick={() => void load()} disabled={loading} className="mt-4 min-h-12 w-full rounded-lg bg-ocean px-4 py-3 text-sm font-semibold text-white hover:bg-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean disabled:opacity-60 sm:w-auto">{loading ? text.loading : copy.show}</button>
      <p className="mt-3 text-xs leading-5 text-slate-500">{copy.cache}</p>
      <div role="status" aria-live="polite" className="mt-3 text-sm text-slate-600">{loading ? text.loading : failed ? text.unavailable : data ? `${text.fetched}: ${format(data.fetchedAt)}` : ''}</div>
      {data ? <>
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
          <p>{copy.notice}</p>
          <p>{copy.next}: {format(data.nextRefreshAt)}</p>
          {old ? <p className="mt-1 font-semibold">{copy.old}</p> : null}
          {data.refreshUnavailable || failed ? <p className="mt-1 font-semibold">{copy.failedRefresh}</p> : null}
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">{copy.all}</p>
        <nav aria-label={text.heading} className="my-4 flex flex-wrap gap-3">
          <a href="#fnc-arrivals" className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-ocean">{text.arrivals} ({data.arrivals.length}) ↓</a>
          <a href="#fnc-departures" className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-ocean">{text.departures} ({data.departures.length}) ↓</a>
        </nav>
        <div className="grid min-w-0 gap-5 lg:grid-cols-2">
          {(['arrivals', 'departures'] as FlightDirection[]).map(direction => <section id={`fnc-${direction}`} key={direction} aria-labelledby={`fnc-${direction}-heading`} className="min-w-0 scroll-mt-24 overflow-hidden rounded-xl border border-slate-200">
            <div className="flex items-center justify-between gap-2 bg-panel p-4">
              <h3 id={`fnc-${direction}-heading`} className="text-lg font-semibold text-navy">{direction === 'arrivals' ? '↘ ' : '↗ '}{text[direction]}</h3>
              <span className="text-xs text-slate-600">{data[direction].length} {copy.records}</span>
            </div>
            <div role="region" aria-label={text[direction]} tabIndex={0} className="max-h-[36rem] overflow-y-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocean">
              {data[direction].length ? <ul className="divide-y divide-slate-200">{data[direction].map((flight, index) => <li key={`${flight.number}:${flight.scheduled}:${index}`} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-navy">{flight.number}</span>
                  <span className={`rounded-md px-2 py-1 text-xs font-medium ${['Canceled', 'Delayed', 'Diverted', 'CanceledUncertain'].includes(flight.status) ? 'bg-amber-50 text-amber-900' : 'bg-slate-100 text-slate-700'}`}>{text.statuses[flight.status]}</span>
                </div>
                <p className="mt-2 break-words text-sm font-medium text-navy"><span className="font-normal text-slate-500">{direction === 'arrivals' ? text.from : text.to}: </span>{flight.airport || flight.airportCode || '—'}{flight.airport && flight.airportCode ? ` (${flight.airportCode})` : ''}</p>
                <p className="mt-1 text-xs text-slate-500">{flight.airline}</p>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-xs text-slate-500">{text.scheduled}</dt><dd className="mt-1 font-medium text-navy">{format(flight.scheduled)}</dd></div>
                  <div><dt className="text-xs text-slate-500">{text.revised}</dt><dd className="mt-1 font-medium text-navy">{format(flight.revised)}</dd></div>
                </dl>
              </li>)}</ul> : <p className="p-4 text-sm text-slate-600">{text.empty}</p>}
            </div>
          </section>)}
        </div>
        <p className="mt-4 text-xs text-slate-500">{text.source}: <a href="https://aviationstack.com/" target="_blank" rel="noopener noreferrer" className="underline">Aviationstack</a></p>
      </> : null}
      <a href="https://www.madeiraairport.pt/en/fnc/flights-destinations/find-flights/real-time-arrivals" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-ocean underline">{text.official} ↗</a>
    </section>
  );
}
