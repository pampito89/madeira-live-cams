import { useRef } from 'react';
import { useText } from '../lib/i18n/TranslationProvider';
import type { Locale } from '../lib/i18n/config';

export const locationSearchCopy: Record<Locale, { placeholder: string; clear: string; empty: string }> = {
  en: { placeholder: 'Search locations…', clear: 'Clear search', empty: 'No locations found.' },
  uk: { placeholder: 'Пошук локацій…', clear: 'Очистити пошук', empty: 'Локацій не знайдено.' },
  pt: { placeholder: 'Pesquisar locais…', clear: 'Limpar pesquisa', empty: 'Nenhum local encontrado.' },
  de: { placeholder: 'Orte suchen…', clear: 'Suche löschen', empty: 'Keine Orte gefunden.' },
  fr: { placeholder: 'Rechercher un lieu…', clear: 'Effacer la recherche', empty: 'Aucun lieu trouvé.' },
  es: { placeholder: 'Buscar lugares…', clear: 'Borrar búsqueda', empty: 'No se encontraron lugares.' },
  pl: { placeholder: 'Szukaj miejsc…', clear: 'Wyczyść wyszukiwanie', empty: 'Nie znaleziono miejsc.' },
};

export function normalizeLocationSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’'`]/g, '').replace(/[\s.,/\\:;!?()[\]{}&+_-]+/g, ' ').trim();
}

export default function LocationQuickSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { language } = useText();
  const text = locationSearchCopy[language];
  const input = useRef<HTMLInputElement>(null);
  function clear() { onChange(''); input.current?.focus(); }
  return <div role="search" aria-label={text.placeholder} className="relative w-full sm:w-72">
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
    <input ref={input} type="search" value={value} onChange={event => onChange(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') clear(); }} placeholder={text.placeholder} aria-label={text.placeholder} aria-controls="location-search-results" autoComplete="off" className="min-h-11 w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-11 text-base text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20 [&::-webkit-search-cancel-button]:appearance-none"/>
    {value && <button type="button" onClick={clear} aria-label={text.clear} title={text.clear} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-500 hover:text-ocean focus-visible:outline-ocean">×</button>}
  </div>;
}
