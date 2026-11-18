import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { locations, getLocalizedLocation, plannerLocationPath } from '../data/plannerLocations';
import { useMessages } from '../lib/i18n/useMessages';
import { useText } from '../lib/i18n/TranslationProvider';
import { rememberNavigationPosition } from '../lib/useNavigationMemory';
import type { Locale } from '../lib/i18n/config';

const copy: Record<Locale, { label: string; hint: string; placeholder: string; clear: string; empty: string; results: string }> = {
  en: { label: 'Quick location search', hint: 'Search all locations, including villas, restaurants and supermarkets. Filters do not limit this search.', placeholder: 'Name, area or type of place…', clear: 'Clear search', empty: 'No locations found. Try another name or area.', results: 'Locations found' },
  uk: { label: 'Швидкий пошук локацій', hint: 'Пошук усіх локацій, включно з віллами, ресторанами та супермаркетами. Фільтри не обмежують пошук.', placeholder: 'Назва, район або тип місця…', clear: 'Очистити пошук', empty: 'Локацій не знайдено. Спробуйте іншу назву або район.', results: 'Знайдено локацій' },
  pt: { label: 'Pesquisa rápida de locais', hint: 'Pesquise todos os locais, incluindo villas, restaurantes e supermercados. Os filtros não limitam esta pesquisa.', placeholder: 'Nome, zona ou tipo de local…', clear: 'Limpar pesquisa', empty: 'Nenhum local encontrado. Experimente outro nome ou zona.', results: 'Locais encontrados' },
  de: { label: 'Schnelle Ortssuche', hint: 'Alle Orte durchsuchen, einschließlich Villen, Restaurants und Supermärkten. Filter schränken diese Suche nicht ein.', placeholder: 'Name, Gegend oder Art des Ortes…', clear: 'Suche löschen', empty: 'Keine Orte gefunden. Versuchen Sie einen anderen Namen oder eine andere Gegend.', results: 'Gefundene Orte' },
  fr: { label: 'Recherche rapide de lieux', hint: 'Recherchez tous les lieux, y compris les villas, restaurants et supermarchés. Les filtres ne limitent pas cette recherche.', placeholder: 'Nom, quartier ou type de lieu…', clear: 'Effacer la recherche', empty: 'Aucun lieu trouvé. Essayez un autre nom ou quartier.', results: 'Lieux trouvés' },
  es: { label: 'Búsqueda rápida de lugares', hint: 'Busca todos los lugares, incluidas villas, restaurantes y supermercados. Los filtros no limitan esta búsqueda.', placeholder: 'Nombre, zona o tipo de lugar…', clear: 'Borrar búsqueda', empty: 'No se encontraron lugares. Prueba otro nombre o zona.', results: 'Lugares encontrados' },
  pl: { label: 'Szybkie wyszukiwanie miejsc', hint: 'Szukaj wszystkich miejsc, w tym willi, restauracji i supermarketów. Filtry nie ograniczają wyszukiwania.', placeholder: 'Nazwa, okolica lub rodzaj miejsca…', clear: 'Wyczyść wyszukiwanie', empty: 'Nie znaleziono miejsc. Spróbuj innej nazwy lub okolicy.', results: 'Znalezione miejsca' },
};

export function normalizeLocationSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’'`]/g, '').replace(/[\s.,/\\:;!?()[\]{}&+_-]+/g, ' ').trim();
}

export default function LocationQuickSearch() {
  const { locale } = useMessages();
  const { language, translate } = useText();
  const text = copy[language];
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const index = useMemo(() => locations.map(location => {
    const display = getLocalizedLocation(location, locale);
    const name = translate(display.name);
    const category = translate(display.category);
    const area = translate(display.area);
    return {
      href: plannerLocationPath(location), name, category, area,
      search: normalizeLocationSearch([name, category, area, location.slug, ...Object.values(location.name), ...Object.values(location.area), ...Object.values(location.category), ...Object.values(location.summary), ...location.tags].join(' ')),
    };
  }), [locale, translate]);
  const normalized = normalizeLocationSearch(query);
  const results = useMemo(() => {
    if (!normalized) return [];
    const words = normalized.split(' ');
    return index.filter(item => words.every(word => item.search.includes(word))).sort((a, b) => {
      const rank = (name: string) => normalizeLocationSearch(name) === normalized ? 0 : normalizeLocationSearch(name).startsWith(normalized) ? 1 : 2;
      return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name, language);
    });
  }, [index, normalized, language]);
  function clear() { setQuery(''); input.current?.focus(); }
  return <div role="search" aria-label={text.label} className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
    <label htmlFor="location-quick-search" className="block text-sm font-semibold text-navy">{text.label}</label>
    <div className="mt-2 flex items-center gap-2">
      <input ref={input} id="location-quick-search" type="search" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') clear(); }} placeholder={text.placeholder} aria-describedby="location-search-hint" aria-controls="location-search-results" autoComplete="off" className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20" />
      {query && <button type="button" onClick={clear} aria-label={text.clear} title={text.clear} className="min-h-11 min-w-11 rounded-xl border border-slate-200 text-xl text-slate-600 hover:border-ocean focus-visible:outline-ocean">×</button>}
    </div>
    <p id="location-search-hint" className="mt-2 text-xs leading-5 text-slate-500">{text.hint}</p>
    <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 text-sm text-slate-600">{normalized ? results.length ? `${text.results}: ${results.length}` : text.empty : ''}</p>
    <ul id="location-search-results" className={results.length ? 'mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100' : ''}>
      {results.map(result => <li key={result.href}><Link href={result.href} onClick={() => rememberNavigationPosition()} className="block px-3 py-3 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-ocean">
        <span className="block break-words text-sm font-semibold text-navy">{result.name}</span>
        <span className="mt-1 block text-xs text-slate-500">{result.category} · {result.area}</span>
      </Link></li>)}
    </ul>
  </div>;
}
