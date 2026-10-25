import { useMessages } from '../lib/i18n/useMessages';
import type { Locale } from '../lib/i18n/config';

const labels: Record<Locale, { navigation: string; back: string; forward: string }> = {
  en: { navigation: 'Page history', back: 'Back', forward: 'Forward' },
  uk: { navigation: 'Історія переходів', back: 'Назад', forward: 'Вперед' },
  pt: { navigation: 'Histórico de navegação', back: 'Voltar', forward: 'Avançar' },
  de: { navigation: 'Seitenverlauf', back: 'Zurück', forward: 'Vorwärts' },
  fr: { navigation: 'Historique de navigation', back: 'Retour', forward: 'Suivant' },
  es: { navigation: 'Historial de navegación', back: 'Atrás', forward: 'Adelante' },
  pl: { navigation: 'Historia przeglądania', back: 'Wstecz', forward: 'Dalej' },
};

export default function HistoryNavigation() {
  const { siteLocale } = useMessages();
  const text = labels[siteLocale];
  const buttonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-navy transition hover:border-ocean hover:bg-panel hover:text-ocean focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2';
  return <nav aria-label={text.navigation} className="flex gap-2 pt-2">
    <button type="button" onClick={() => window.history.back()} className={buttonClass}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m12 5-7 7 7 7M5 12h14" /></svg>
      <span>{text.back}</span>
    </button>
    <button type="button" onClick={() => window.history.forward()} className={buttonClass}>
      <span>{text.forward}</span>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m12 5 7 7-7 7M5 12h14" /></svg>
    </button>
  </nav>;
}
