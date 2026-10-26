import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Locale } from '../lib/i18n/config';
import { monthDays, selectRangeDay, shiftMonth, type EventDateRange } from '../lib/events';
import styles from '../styles/event-calendar.module.css';

const copy: Record<Locale, string[]> = {
  en: ['Dates', 'Any dates', 'Choose dates', 'Choose a day, then an end date if needed.', 'Choose an end date, or apply for one day.', 'Previous month', 'Next month', 'Clear dates', 'Apply', 'Close'],
  uk: ['Дати', 'Будь-які дати', 'Виберіть дати', 'Виберіть день, а за потреби — кінцеву дату.', 'Виберіть кінцеву дату або застосуйте один день.', 'Попередній місяць', 'Наступний місяць', 'Очистити дати', 'Застосувати', 'Закрити'],
  pt: ['Datas', 'Todas as datas', 'Escolher datas', 'Escolha um dia e, se necessário, uma data final.', 'Escolha a data final ou aplique apenas um dia.', 'Mês anterior', 'Mês seguinte', 'Limpar datas', 'Aplicar', 'Fechar'],
  de: ['Datum', 'Alle Daten', 'Datum wählen', 'Wählen Sie einen Tag und bei Bedarf ein Enddatum.', 'Wählen Sie das Enddatum oder übernehmen Sie einen Tag.', 'Vorheriger Monat', 'Nächster Monat', 'Datum löschen', 'Anwenden', 'Schließen'],
  fr: ['Dates', 'Toutes les dates', 'Choisir les dates', 'Choisissez un jour, puis une date de fin si besoin.', 'Choisissez la fin ou appliquez un seul jour.', 'Mois précédent', 'Mois suivant', 'Effacer les dates', 'Appliquer', 'Fermer'],
  es: ['Fechas', 'Todas las fechas', 'Elegir fechas', 'Elige un día y, si lo necesitas, una fecha final.', 'Elige la fecha final o aplica un solo día.', 'Mes anterior', 'Mes siguiente', 'Borrar fechas', 'Aplicar', 'Cerrar'],
  pl: ['Daty', 'Dowolne daty', 'Wybierz daty', 'Wybierz dzień, a w razie potrzeby datę końcową.', 'Wybierz datę końcową lub zastosuj jeden dzień.', 'Poprzedni miesiąc', 'Następny miesiąc', 'Wyczyść daty', 'Zastosuj', 'Zamknij'],
};
export default function EventDateFilter({ locale, today, value, onChange }: {
  locale: Locale; today: string; value: EventDateRange; onChange: (range: EventDateRange) => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [draft, setDraft] = useState(value);
  const [choosingEnd, setChoosingEnd] = useState(false);
  const [focusDay, setFocusDay] = useState('');
  const [label, any, title, startHelp, endHelp, previous, next, clear, apply, close] = copy[locale];
  const language = locale === 'en' ? 'en-GB' : locale;
  const date = (day: string) => new Date(`${day}T12:00:00Z`);
  const shortFormat = new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const fullFormat = new Intl.DateTimeFormat(language, { dateStyle: 'full', timeZone: 'UTC' });
  const rangeText = (range: EventDateRange) => !range.from ? any : range.from === range.to || !range.to ? shortFormat.format(date(range.from)) : `${shortFormat.format(date(range.from))} – ${shortFormat.format(date(range.to))}`;
  const heading = new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date(`${month}-01`));
  const weekdayFormat = new Intl.DateTimeFormat(language, { weekday: 'short', timeZone: 'UTC' });
  const weekdays = Array.from({ length: 7 }, (_, index) => weekdayFormat.format(new Date(Date.UTC(2026, 0, 5 + index))));
  useEffect(() => {
    if (focusDay && dialog.current?.open) dialog.current.querySelector<HTMLButtonElement>(`[data-day="${focusDay}"]`)?.focus();
  }, [focusDay, month]);
  const open = () => {
    setDraft(value); setChoosingEnd(false); setMonth((value.from || today).slice(0, 7)); setFocusDay('');
    dialog.current?.showModal();
  };
  const dismiss = () => dialog.current?.close();
  const choose = (day: string) => {
    const selected = selectRangeDay(draft, day, choosingEnd);
    setDraft(selected.range); setChoosingEnd(selected.choosingEnd);
  };
  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, day: string) => {
    const delta: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (!(event.key in delta)) return;
    event.preventDefault();
    const target = date(day); target.setUTCDate(target.getUTCDate() + delta[event.key]);
    const iso = target.toISOString().slice(0, 10);
    setMonth(iso.slice(0, 7)); setFocusDay(iso);
  };
  return <div className={styles.field}>
    <span id={`${id}-label`}>{label}</span>
    <button ref={trigger} type="button" className={styles.trigger} aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="dialog" onClick={open}><span id={`${id}-value`}>{rangeText(value)}</span><span aria-hidden="true">▦</span></button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${id}-title`} aria-describedby={`${id}-help`} onClose={() => trigger.current?.focus()}>
      <div className={styles.header}><h2 id={`${id}-title`}>{title}</h2><button type="button" onClick={dismiss} aria-label={close}>×</button></div>
      <p id={`${id}-help`} className={styles.help} aria-live="polite">{choosingEnd ? endHelp : startHelp}</p>
      <div className={styles.navigation}><button type="button" aria-label={previous} onClick={() => setMonth(shiftMonth(month, -1))}>‹</button><h3 aria-live="polite">{heading}</h3><button type="button" aria-label={next} onClick={() => setMonth(shiftMonth(month, 1))}>›</button></div>
      <div className={styles.days} role="group" aria-label={heading}>
        {weekdays.map((day, index) => <span className={styles.weekday} key={`weekday-${index}`}>{day}</span>)}
        {monthDays(month).map((day, index) => day ? <button key={day} type="button" data-day={day} className={styles.day} data-edge={day === draft.from || day === draft.to} aria-pressed={!!draft.from && day >= draft.from && day <= draft.to} aria-current={day === today ? 'date' : undefined} aria-label={fullFormat.format(date(day))} onClick={() => choose(day)} onKeyDown={event => moveFocus(event, day)}>{Number(day.slice(-2))}</button> : <span key={`empty-${index}`} aria-hidden="true" />)}
      </div>
      <p className={styles.selection} role="status">{rangeText(draft)}</p>
      <div className={styles.actions}><button type="button" onClick={() => { onChange({ from: '', to: '' }); dismiss(); }}>{clear}</button><button type="button" className={styles.apply} disabled={!draft.from} onClick={() => { onChange(draft); dismiss(); }}>{apply}</button></div>
    </dialog>
  </div>;
}
