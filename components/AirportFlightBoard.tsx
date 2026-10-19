import { useEffect, useRef, useState } from 'react';
import type { FlightSnapshot } from '../lib/aviationstack';
import type { FlightDirection } from '../lib/airportFlights';
import { remainingToday, flightSearchKey } from '../lib/todayFlights';
import { airportFlightText } from '../lib/i18n/airportFlights';
import { flightSnapshotText } from '../lib/i18n/flightSnapshot';
import type { Locale } from '../lib/i18n/config';
export default function AirportFlightBoard({ locale }: { locale: Locale }) {
  const text = airportFlightText(locale);
  const copy = flightSnapshotText(locale);
  const [data, setData] = useState<FlightSnapshot | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(0);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => { const controller = active.current; active.current = null; controller?.abort(); }, []);
  useEffect(() => {
    if (!data) return;
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
      if (!Array.isArray(result.arrivals) || !Array.isArray(result.departures) || !Number.isFinite(Date.parse(result.fetchedAt))) throw new Error('Invalid data');
      if (active.current === controller) { setData(result); setNow(Date.now()); }
    } catch { if (active.current === controller) { setFailed(true); setData(null); } }
    finally { window.clearTimeout(timeout); if (active.current === controller) { active.current = null; setLoading(false); } }
  }
  const format = (value: string | null) => value ? new Intl.DateTimeFormat(locale, { timeZone: 'Atlantic/Madeira', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(value)) : '—';
  const search = flightSearchKey(query);
  return <section id="airport-flights" aria-labelledby="airport-flights-heading" className="mt-5 min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><h2 id="airport-flights-heading" className="text-lg font-semibold text-navy">{text.heading}</h2><p className="text-xs text-slate-500">{copy.today}</p></div>
      <button type="button" onClick={() => void load()} disabled={loading} className="min-h-11 rounded-lg bg-ocean px-4 py-2 text-sm font-semibold text-white hover:bg-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean disabled:opacity-60">{loading ? text.loading : data ? text.refresh : copy.show}</button>
    </div>
    <div role="status" aria-live="polite" className="mt-1 text-xs text-slate-500">{failed ? text.unavailable : data ? `${text.fetched}: ${format(data.fetchedAt)}` : ''}</div>
    {data ? <>
      <label className="mt-2 block"><span className="sr-only">{text.search}</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={text.search} className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base text-navy focus:border-ocean" /></label>
      <div className="mt-3 grid min-w-0 gap-3 lg:grid-cols-2">
        {(['arrivals', 'departures'] as FlightDirection[]).map(direction => {
          const flights = remainingToday(data[direction], now).filter(flight => !search || flightSearchKey(flight.number).includes(search));
          return <section id={`fnc-${direction}`} key={direction} aria-labelledby={`fnc-${direction}-heading`} className="min-w-0 scroll-mt-24 overflow-hidden rounded-lg border border-slate-200">
            <h3 id={`fnc-${direction}-heading`} className="bg-panel px-2.5 py-1.5 text-sm font-semibold text-navy">{direction === 'arrivals' ? '↘ ' : '↗ '}{text[direction]} <span className="text-xs font-normal text-slate-500">({flights.length})</span></h3>
            <div role="region" aria-label={text[direction]} tabIndex={0} className="max-h-80 overflow-y-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocean">
              {flights.length ? <ul className="divide-y divide-slate-100">{flights.map((flight, index) => <li key={`${flight.number}:${flight.scheduled}:${index}`} className="px-2.5 py-1.5">
                <div className="grid grid-cols-[2.75rem,minmax(0,1fr)] items-start gap-x-2 text-xs leading-4">
                  <div className="font-semibold tabular-nums text-navy"><span aria-label={text.scheduled} className={flight.revised && flight.revised !== flight.scheduled ? 'font-normal text-slate-500 line-through' : ''}>{format(flight.scheduled)}</span>{flight.revised && flight.revised !== flight.scheduled ? <div aria-label={text.revised}>{format(flight.revised)}</div> : null}</div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2"><strong className="text-navy">{flight.number}</strong><span className="min-w-0 break-words font-medium text-navy">{flight.airport || flight.airportCode || '—'}</span></div>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-slate-500"><span className="min-w-0 break-words">{flight.airline}</span><span className={['Canceled', 'Delayed', 'Diverted'].includes(flight.status) ? 'text-amber-800' : 'text-slate-600'}>{text.statuses[flight.status]}</span></div>
                  </div>
                </div>
              </li>)}</ul> : <p className="p-3 text-sm text-slate-500">{search ? text.noMatches : copy.empty}</p>}
            </div>
          </section>;
        })}
      </div>
    </> : null}
    <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500"><a href="https://www.madeiraairport.pt/en/fnc/flights-destinations/find-flights/real-time-arrivals" target="_blank" rel="noopener noreferrer" className="underline">{text.official} ↗</a><a href="https://aviationstack.com/" target="_blank" rel="noopener noreferrer">Aviationstack</a></div>
  </section>;
}
