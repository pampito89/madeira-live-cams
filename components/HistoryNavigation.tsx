import Link from 'next/link';
import { useMessages } from '../lib/i18n/useMessages';
import type { Locale } from '../lib/i18n/config';
const labels: Record<Locale, { navigation: string; back: string; forward: string; news: string }> = {
    en: { navigation: 'Page history', back: 'Back', forward: 'Forward', news: 'News' },
    uk: { navigation: 'Історія переходів', back: 'Назад', forward: 'Вперед', news: 'Новини' },
    pt: { navigation: 'Histórico de navegação', back: 'Voltar', forward: 'Avançar', news: 'Notícias' },
    de: { navigation: 'Seitenverlauf', back: 'Zurück', forward: 'Vorwärts', news: 'Nachrichten' },
    fr: { navigation: 'Historique de navigation', back: 'Retour', forward: 'Suivant', news: 'Actualités' },
    es: { navigation: 'Historial de navegación', back: 'Atrás', forward: 'Adelante', news: 'Noticias' },
    pl: { navigation: 'Historia przeglądania', back: 'Wstecz', forward: 'Dalej', news: 'Wiadomości' },
};
export default function HistoryNavigation() {
    const { siteLocale } = useMessages();
    const text = labels[siteLocale];
    const buttonClass = 'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-navy shadow-sm transition hover:border-ocean hover:bg-panel hover:text-ocean active:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2 sm:h-9 sm:w-9';
    return <div className="flex shrink-0 items-center gap-1 sm:gap-3">
      <nav aria-label={text.navigation} className="flex h-11 shrink-0 items-center gap-1 sm:gap-2">
        <button type="button" aria-label={text.back} title={text.back} onClick={() => window.history.back()} className={buttonClass}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m12 5-7 7 7 7M5 12h14"/></svg>
        </button>
        <button type="button" aria-label={text.forward} title={text.forward} onClick={() => window.history.forward()} className={buttonClass}>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m12 5 7 7-7 7M5 12h14"/></svg>
        </button>
      </nav>
      <Link href="/news" locale="en" title={text.news} aria-label={text.news} className="inline-flex h-11 min-w-9 items-center justify-center gap-2 rounded-lg px-1 text-sm font-semibold text-ocean hover:bg-panel focus:outline-none focus:ring-2 focus:ring-ocean sm:px-2">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h4M7 16h4M14 12h3M14 16h3"/></svg>
        <span className="hidden lg:inline">{text.news}</span>
      </Link>
    </div>;
}
