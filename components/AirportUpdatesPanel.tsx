import { useEffect, useState } from 'react';
import type { AirportUpdates } from '../lib/airportUpdates';
import { airportUpdatesText } from '../lib/i18n/airportUpdates';
import type { Locale } from '../lib/i18n/config';

export default function AirportUpdatesPanel({ locale }: { locale: Locale }) {
  const text = airportUpdatesText(locale);
  const [data, setData] = useState<AirportUpdates | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stopped = false;
    let active: AbortController | null = null;
    async function load() {
      if (active) return;
      const controller = new AbortController();
      active = controller;
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch('/api/airport-updates', { signal: controller.signal });
        if (!response.ok) throw new Error('Unavailable');
        const result: AirportUpdates = await response.json();
        if (!Array.isArray(result.news) || !Number.isFinite(Date.parse(result.fetchedAt))) throw new Error('Invalid');
        if (!stopped) { setData(result); setFailed(false); }
      } catch {
        if (!stopped) { setData(null); setFailed(true); }
      } finally {
        window.clearTimeout(timeout);
        active = null;
      }
    }
    const refresh = () => { if (!document.hidden) void load(); };
    void load();
    const timer = window.setInterval(refresh, 300000);
    document.addEventListener('visibilitychange', refresh);
    return () => { stopped = true; active?.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, []);

  const format = (value: string) => new Intl.DateTimeFormat(locale, { timeZone: 'Atlantic/Madeira', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

  return <section aria-labelledby="airport-updates-heading" className="mt-4 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 id="airport-updates-heading" className="text-base font-semibold text-navy">{text.news}</h2>
      {data ? <span className="text-xs text-slate-500">{text.checked}: <time dateTime={data.fetchedAt}>{format(data.fetchedAt)}</time></span> : null}
    </div>
    {!data ? <p role="status" className="mt-2 text-sm text-slate-600">{failed ? text.unavailable : text.loading}</p> : !data.newsAvailable ? <p role="status" className="mt-2 text-xs text-slate-500">{text.unavailable}</p> : data.news.length ? <ul className="mt-2 space-y-3">
      {data.news.map(n => <li key={n.url}>
        <a lang="pt" href={n.url} target="_blank" rel="noopener noreferrer" className="text-sm text-ocean underline">{n.title}</a>
        <p className="text-xs text-slate-500"><time dateTime={n.publishedAt}>{format(n.publishedAt)}</time></p>
      </li>)}
    </ul> : <p className="mt-2 text-xs text-slate-500">{text.emptyNews}</p>}
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ocean">
      <a className="underline" href="https://www.madeiraairport.pt/en/fnc/home" target="_blank" rel="noopener noreferrer">{text.official} ↗</a>
      <a className="underline" href="https://pt.newsroom.ana.pt/news/" target="_blank" rel="noopener noreferrer">ANA ↗</a>
      <a className="underline" href="https://www.jm-madeira.pt/topic/-/meta/aeroporto-da-madeira" target="_blank" rel="noopener noreferrer">{text.local} · JM ↗</a>
    </div>
  </section>;
}
