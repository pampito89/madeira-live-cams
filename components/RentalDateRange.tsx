import { useEffect, useState } from 'react';

export type RentalPeriod = { start: string; end: string };
export function madeiraToday() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Atlantic/Madeira', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-');
}
export function displayRentalDate(value: string) {
  return value ? value.split('-').reverse().join('.') : 'ще не визначено';
}
const dateKey = (date: Date) => date.toISOString().slice(0, 10);
const dateLabel = (value: string) => new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));

export default function RentalDateRange({ value, onChange }: { value: RentalPeriod; onChange: (value: RentalPeriod) => void }) {
  const [today, setToday] = useState('');
  const [month, setMonth] = useState('');
  useEffect(() => {
    const current = madeiraToday();
    setToday(current);
    setMonth(current.slice(0, 7));
  }, []);
  const select = (day: string) => {
    if (!value.start || value.end || day <= value.start) onChange({ start: day, end: '' });
    else onChange({ start: value.start, end: day });
  };
  const moveMonth = (amount: number) => {
    const [year, index] = month.split('-').map(Number);
    setMonth(dateKey(new Date(Date.UTC(year, index - 1 + amount, 1))).slice(0, 7));
  };
  const first = month ? new Date(`${month}-01T12:00:00Z`) : null;
  const days = first ? new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate() : 0;
  const offset = first ? (first.getUTCDay() + 6) % 7 : 0;
  const nights = value.start && value.end ? Math.round((Date.parse(value.end) - Date.parse(value.start)) / 86400000) : 0;
  const selection = value.start ? value.end ? `${displayRentalDate(value.start)} — ${displayRentalDate(value.end)} · діб: ${nights}` : `Отримання: ${displayRentalDate(value.start)}. Оберіть повернення.` : 'Оберіть дати';
  return <fieldset className="min-w-0 sm:col-span-2">
    <legend className="text-sm font-semibold text-navy">Період оренди (необов’язково)</legend>
    <details className="group mt-3 max-w-md rounded-2xl border border-slate-200 bg-white">
      <summary className="cursor-pointer rounded-2xl px-4 py-4 text-sm font-semibold text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocean">
        <span aria-live="polite">{selection}</span>
        <span className="mt-1 block pl-4 text-xs font-normal text-slate-500 group-open:hidden">Розгорнути календар</span>
        <span className="mt-1 hidden pl-4 text-xs font-normal text-slate-500 group-open:block">Згорнути календар</span>
      </summary>
      <div className="border-t border-slate-200 p-3 sm:p-4" aria-describedby="rental-calendar-help">
        <p id="rental-calendar-help" className="mb-3 text-sm leading-6 text-slate-600">Оберіть дату отримання, потім дату повернення.</p>
        {first ? <>
          <div className="mb-4 flex items-center justify-between gap-2">
            <button type="button" aria-label="Попередній місяць" disabled={month <= today.slice(0, 7)} onClick={() => moveMonth(-1)} className="h-11 w-11 rounded-xl border border-slate-200 text-xl text-navy hover:bg-panel disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocean">‹</button>
            <p aria-live="polite" className="text-center font-semibold capitalize text-navy">{new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first)}</p>
            <button type="button" aria-label="Наступний місяць" onClick={() => moveMonth(1)} className="h-11 w-11 rounded-xl border border-slate-200 text-xl text-navy hover:bg-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocean">›</button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-500" aria-hidden="true">{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(day => <span className="py-2" key={day}>{day}</span>)}</div>
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`} aria-hidden="true" />)}
            {Array.from({ length: days }, (_, index) => {
              const day = `${month}-${String(index + 1).padStart(2, '0')}`;
              const endpoint = day === value.start || day === value.end;
              const between = Boolean(value.start && value.end && day > value.start && day < value.end);
              const selected = endpoint || between;
              return <button key={day} type="button" disabled={day < today} aria-label={`${dateLabel(day)}${day === value.start ? ', отримання' : day === value.end ? ', повернення' : ''}`} aria-pressed={selected} aria-current={day === today ? 'date' : undefined} onClick={() => select(day)} className={`min-h-11 rounded-lg text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean disabled:text-slate-300 disabled:cursor-not-allowed ${endpoint ? 'bg-ocean text-white' : between ? 'bg-emerald-100 text-navy' : 'text-navy enabled:hover:bg-panel'} ${day === today && !selected ? 'ring-1 ring-inset ring-ocean' : ''}`}>{index + 1}</button>;
            })}
          </div>
        </> : <p className="py-8 text-center text-sm text-slate-500">Завантаження календаря…</p>}
        {value.start && <button type="button" onClick={() => onChange({ start: '', end: '' })} className="mt-3 min-h-11 text-sm font-semibold text-ocean underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ocean">Очистити дати</button>}
      </div>
    </details>
  </fieldset>;
}
