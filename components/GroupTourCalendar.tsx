import { useRef, useState } from 'react';
import { addDays } from '../lib/trailAvailability';
import styles from '../styles/groupTourCalendar.module.css';

export type TourRange = { from: string; to: string };
type Props = { today: string; uk: boolean; onChange: (ranges: TourRange[]) => void };

export default function GroupTourCalendar({ today, uk, onChange }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [ranges, setRanges] = useState<TourRange[]>([]);
  const [month, setMonth] = useState(today.slice(0, 7) + '-01');
  const [from, setFrom] = useState('');
  const addButton = useRef<HTMLButtonElement>(null);
  const t = (en: string, ua: string) => uk ? ua : en;
  const format = (date: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(uk ? 'uk-UA' : 'en-GB', { ...options, timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));
  const label = (date: string) => format(date, { day: 'numeric', month: 'short', year: 'numeric' });
  const first = new Date(month + 'T12:00:00Z');
  const offset = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const cells = Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, i) => i < offset || i >= offset + count ? null : addDays(month, i - offset));
  function moveMonth(step: number) {
    const next = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + step, 1, 12));
    setMonth(next.toISOString().slice(0, 10));
  }
  function update(next: TourRange[]) { setRanges(next); onChange(enabled ? next : []); }
  function closeCalendar() {
    setOpen(false); setFrom('');
    addButton.current?.focus({ preventScroll: true });
  }
  function choose(date: string) {
    if (!from) { setFrom(date); return; }
    const range = { from: date < from ? date : from, to: date < from ? from : date };
    if (!ranges.some(item => item.from === range.from && item.to === range.to)) update([...ranges, range].sort((a, b) => a.from.localeCompare(b.from)));
    closeCalendar();
  }
  return <div className={styles.controls}>
    <label className={styles.toggle}><input type="checkbox" checked={enabled} aria-controls="group-tour-calendar" aria-expanded={enabled} onChange={event => { setEnabled(event.target.checked); setOpen(false); setFrom(''); onChange(event.target.checked ? ranges : []); }} />{t('Group tour', 'Груповий тур')}</label>
    {enabled && <div id="group-tour-calendar" className={styles.panel}>
      {ranges.length > 0 && <ul className={styles.ranges} aria-live="polite" aria-label={t('Added ranges', 'Додані діапазони')}>{ranges.map((range, index) => <li key={`${range.from}/${range.to}`}><span>{label(range.from)} – {label(range.to)}</span><button type="button" aria-label={`${t('Remove range', 'Видалити діапазон')} ${label(range.from)} – ${label(range.to)}`} onClick={() => update(ranges.filter((_, i) => i !== index))}>×</button></li>)}</ul>}
      <button ref={addButton} className={styles.add} type="button" aria-expanded={open} aria-controls="group-tour-date-picker" onClick={() => { setFrom(''); setOpen(!open); }}>{open ? t('Hide calendar', 'Сховати календар') : t('+ Add range', '+ Додати діапазон')}</button>
      {open && <div id="group-tour-date-picker" className={styles.calendar} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); closeCalendar(); } }}>
        <div className={styles.month}><button type="button" aria-label={t('Previous month', 'Попередній місяць')} onClick={() => moveMonth(-1)}>‹</button><strong aria-live="polite">{format(month, { month: 'long', year: 'numeric' })}</strong><button type="button" aria-label={t('Next month', 'Наступний місяць')} onClick={() => moveMonth(1)}>›</button></div>
        <p className={styles.hint} role="status">{from ? `${label(from)} · ${t('Choose the end date', 'Оберіть кінцеву дату')}` : t('Choose the start and then the end date', 'Оберіть початкову, а потім кінцеву дату')}</p>
        <div className={styles.grid}>
          {(uk ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'] : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']).map(day => <span className={styles.weekday} key={day}>{day}</span>)}
          {cells.map((date, i) => {
            if (!date) return <span key={`blank-${i}`} />;
            const saved = ranges.some(range => date >= range.from && date <= range.to);
            return <button key={date} type="button" aria-label={label(date)} aria-pressed={date === from} aria-current={date === today ? 'date' : undefined} className={`${styles.day} ${saved ? styles.saved : ''} ${date === from ? styles.endpoint : ''}`} onClick={() => choose(date)}>{Number(date.slice(8))}</button>;
          })}
        </div>
      </div>}
    </div>}
  </div>;
}
