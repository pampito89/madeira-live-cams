import { useCallback, useEffect, useRef, useState } from 'react';
import type { AirportFlightBoard as Board, FlightDirection } from '../lib/airportFlights';
import { airportFlightText } from '../lib/i18n/airportFlights';
import type { Locale } from '../lib/i18n/config';

export default function AirportFlightBoard({ locale }: { locale: Locale }) {
  const text = airportFlightText(locale);
  const [direction, setDirection] = useState<FlightDirection>('arrivals');
  const [query, setQuery] = useState('');
  const [data, setData] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const active = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    setLoading(true);
    try {
      const response = await fetch('/api/airport-flights', { signal: controller.signal });
      if (!response.ok) throw new Error('Unavailable');
      const result: Board = await response.json();
      if (!Array.isArray(result.arrivals) || !Array.isArray(result.departures) || !Number.isFinite(Date.parse(result.fetchedAt))) throw new Error('Invalid data');
      setData(result);
      setFailed(false);
    } catch {
      if (active.current === controller) { setData(null); setFailed(true); }
    } finally {
      window.clearTimeout(timeout);
      if (active.current === controller) { active.current = null; setLoading(false); }
    }
  }, []);
  useEffect(() => {
    void load();
    const interval = window.setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 300_000);
    return () => { window.clearInterval(interval); const controller = active.current; active.current = null; controller?.abort(); };
  }, [load]);
  const search = query.replace(/\s+/g, '').toUpperCase();
  const flights = data?.[direction].filter(flight => flight.number.replace(/\s+/g, '').toUpperCase().includes(search)) ?? [];
  const format = (value: string | null) => value ? new Intl.DateTimeFormat(locale, { timeZone: 'Atlantic/Madeira', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(value)) : '—';
  const officialUrl = `https://www.madeiraairport.pt/en/fnc/flights-destinations/find-flights/real-time-${direction}`;
  return (
    <section id="airport-flights" aria-labelledby="airport-flights-heading" className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 id="airport-flights-heading" className="text-xl font-semibold text-navy">{text.heading}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text.period}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label={text.heading}>
          {(['arrivals', 'departures'] as const).map(value => <button key={value} type="button" aria-pressed={direction === value} onClick={() => setDirection(value)} className={`min-h-11 rounded-lg border px-5 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean ${direction === value ? 'border-ocean bg-ocean text-white' : 'border-slate-300 text-navy hover:bg-panel'}`}>{text[value]}</button>)}
          <button type="button" onClick={() => void load()} disabled={loading} className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm text-navy disabled:opacity-50">{text.refresh}</button>
        </div>
        <label className="mt-4 block text-sm font-medium text-navy" htmlFor="airport-flight-search">{text.search}</label>
        <input id="airport-flight-search" type="search" value={query} onChange={event => setQuery(event.target.value)} maxLength={30} placeholder="TP1685" className="mt-1 min-h-11 w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-navy" />
      </div>
      <div aria-live="polite" role="status" className="px-5 py-3 text-sm text-slate-600">
        {loading ? text.loading : failed ? text.unavailable : data ? `${text.fetched}: ${format(data.fetchedAt)}` : ''}
      </div>
      {data && !failed ? <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={text[direction]}>
        <table className="w-full min-w-[620px] text-left text-sm">
          <caption className="sr-only">{text[direction]}</caption>
          <thead className="bg-panel text-navy"><tr>{[text.scheduled, text.revised, text.flight, direction === 'arrivals' ? text.from : text.to, text.status].map(label => <th key={label} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
          <tbody>{flights.map(flight => <tr key={`${flight.number}:${flight.scheduled}`} className="border-t border-slate-100">
            <td className="whitespace-nowrap px-4 py-3">{format(flight.scheduled)}</td>
            <td className="whitespace-nowrap px-4 py-3 font-medium">{format(flight.revised)}</td>
            <td className="px-4 py-3"><span className="font-semibold text-navy">{flight.number}</span><span className="block text-xs text-slate-500">{flight.airline}</span></td>
            <td className="px-4 py-3">{flight.airport || flight.airportCode || '—'}{flight.airport && flight.airportCode ? ` (${flight.airportCode})` : ''}</td>
            <td className="px-4 py-3"><span className={`inline-block rounded-md px-2 py-1 font-medium ${['Canceled', 'Delayed', 'Diverted', 'CanceledUncertain'].includes(flight.status) ? 'bg-amber-50 text-amber-900' : 'bg-slate-100 text-navy'}`}>{text.statuses[flight.status]}</span></td>
          </tr>)}</tbody>
        </table>
        {!flights.length ? <p className="p-5 text-sm text-slate-600">{search ? text.noMatches : text.empty}</p> : null}
      </div> : null}
      <div className="border-t border-slate-200 p-5 text-xs leading-5 text-slate-500">
        <p>{text.notice}</p>
        {data ? <p>{text.source}: <a href="https://aerodatabox.com/" target="_blank" rel="noopener noreferrer" className="underline">AeroDataBox</a></p> : null}
        <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-ocean underline">{text.official} ↗</a>
      </div>
    </section>
  );
}
