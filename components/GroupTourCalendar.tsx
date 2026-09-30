import { useState } from 'react';
import { addDays } from '../lib/trailAvailability';
import styles from '../styles/groupTourCalendar.module.css';

export type TourRange = { from: string; to: string };
type Props = { today: string; uk: boolean; onChange: (ranges: TourRange[]) => void };

export default function GroupTourCalendar({ today, uk, onChange }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [ranges, setRanges] = useState<TourRange[]>([]);
  const [month, setMonth] = useState(today.slice(0, 7) + '-01');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
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
  function choose(date: string) {
    if (!from || to) { setFrom(date); setTo(''); }
    else { setFrom(date < from ? date : from); setTo(date < from ? from : date); }
  }
  function update(next: TourRange[]) { setRanges(next); onChange(enabled ? next : []); }
  function addRange() {
    if (!from || !to) return;
    if (!ranges.some(range => range.from === from && range.to === to)) update([...ranges, { from, to }].sort((a, b) => a.from.localeCompare(b.from)));
    setFrom(''); setTo('');
  }
  return <div className={styles.controls}>
    <label className={styles.toggle}><input type="checkbox" checked={enabled} aria-controls="group-tour-calendar" aria-expanded={enabled} onChange={event => { setEnabled(event.target.checked); onChange(event.target.checked ? ranges : []); }} />{t('Group tour', 'Груповий тур')}</label>
    {enabled && <div id="group-tour-calendar" className={styles.panel}>
      {ranges.length > 0 && <ul className={styles.ranges} aria-label={t('Added ranges', 'Додані діапазони')}>{ranges.map((range, index) => <li key={`${range.from}/${range.to}`}><span>{label(range.from)} – {label(range.to)}</span><button type="button" aria-label={`${t('Remove range', 'Видалити діапазон')} ${label(range.from)} – ${label(range.to)}`} onClick={() => update(ranges.filter((_, i) => i !== index))}>×</button></li>)}</ul>}
      <div className={styles.calendar}>
        <div className={styles.month}><button type="button" aria-label={t('Previous month', 'Попередній місяць')} onClick={() => moveMonth(-1)}>‹</button><strong aria-live="polite">{format(month, { month: 'long', year: 'numeric' })}</strong><button type="button" aria-label={t('Next month', 'Наступний місяць')} onClick={() => moveMonth(1)}>›</button></div>
        <p className={styles.hint} role="status">{to ? `${label(from)} – ${label(to)}` : from ? `${label(from)} · ${t('Choose the end date', 'Оберіть кінцеву дату')}` : t('Choose the start and then the end date', 'Оберіть початкову, а потім кінцеву дату')}</p>
        <div className={styles.grid}>
          {(uk ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'] : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']).map(day => <span className={styles.weekday} key={day}>{day}</span>)}
          {cells.map((date, i) => {
            if (!date) return <span key={`blank-${i}`} />;
            const endpoint = date === from || date === to;
            const draft = !!from && !!to && date >= from && date <= to;
            const saved = ranges.some(range => date >= range.from && date <= range.to);
            return <button key={date} type="button" aria-label={label(date)} aria-pressed={endpoint || draft} aria-current={date === today ? 'date' : undefined} className={`${styles.day} ${saved ? styles.saved : ''} ${draft ? styles.draft : ''} ${endpoint ? styles.endpoint : ''}`} onClick={() => choose(date)}>{Number(date.slice(8))}</button>;
          })}
        </div>
      </div>
      <button className={styles.add} type="button" disabled={!from || !to} onClick={addRange}>{t('Add range', 'Додати діапазон')}</button>
    </div>}
  </div>;
}
