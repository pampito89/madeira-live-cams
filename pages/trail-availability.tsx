import { FormEvent, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import { useMessages } from '../lib/i18n/useMessages';
import { addDays, AvailabilityResult, BOOKING_URL, BookingCategory, madeiraDate, Trail, TrailDay } from '../lib/trailAvailability';
import { planningDates, weekStarts } from '../lib/trailPlanning';
import { availableSlots, timeSlotLabel } from '../lib/trailBooking';
import styles from '../styles/trailAvailability.module.css';

type Props = { trails: Trail[]; initialDate: string; catalogUnavailable: boolean };
type Search = { route: number; dates: string[] };
export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const { getTrails } = await import('../lib/simplifica');
  try { return { props: { trails: await getTrails(), initialDate: madeiraDate(), catalogUnavailable: false } }; }
  catch { return { props: { trails: [], initialDate: madeiraDate(), catalogUnavailable: true } }; }
};

export default function TrailAvailabilityPage({ trails, initialDate, catalogUnavailable }: Props) {
  const { locale } = useMessages();
  const uk = locale === 'uk';
  const t = (en: string, ua: string) => uk ? ua : en;
  const [route, setRoute] = useState(String(trails.find(item => item.id === 301)?.id ?? trails[0]?.id ?? ''));
  const [period, setPeriod] = useState(30);
  const [category, setCategory] = useState<BookingCategory>('visitor');
  const [search, setSearch] = useState<Search | null>(null);
  const [days, setDays] = useState<Record<string, TrailDay>>({});
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');
  const [now, setNow] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const version = useRef(0);
  const title = t('Trail availability', 'Завантаженість маршрутів');
  const description = t('View available Madeira PR trail time slots for the next 7, 14, 30 or 60 days using SIMplifica data.', 'Переглядайте доступні тайм-слоти маршрутів PR на Мадейрі на найближчі 7, 14, 30 або 60 днів за даними SIMplifica.');
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => { window.clearInterval(timer); controller.current?.abort(); };
  }, []);
  function reset() {
    version.current += 1;
    controller.current?.abort();
    setLoading(false); setSearch(null); setDays({}); setSelected('');
  }
  async function load(event: FormEvent) {
    event.preventDefault();
    if (!route) return;
    controller.current?.abort();
    const abort = new AbortController(); controller.current = abort;
    const id = ++version.current;
    // Refresh the Madeira date at search time, including after an overnight tab stays open.
    const start = madeiraDate();
    const requested = planningDates(start, addDays(start, period - 1));
    setSearch({ route: Number(route), dates: requested }); setDays({}); setSelected(start); setLoading(true);
    try {
      for (const first of weekStarts(requested)) {
        let batch: TrailDay[];
        try {
          const response = await fetch(`/api/trail-availability?route=${encodeURIComponent(route)}&start=${first}`, { signal: abort.signal });
          const payload: AvailabilityResult = await response.json();
          if (!response.ok || !Array.isArray(payload.days)) throw new Error('Unavailable');
          batch = payload.days;
        } catch {
          if (abort.signal.aborted) return;
          batch = requested.filter(date => date >= first && date <= addDays(first, 6)).map(date => ({ date, slots: [], checkedAt: null, error: true }));
        }
        if (version.current !== id || abort.signal.aborted) return;
        setDays(previous => {
          const next = { ...previous };
          for (const day of batch) if (requested.includes(day.date)) next[day.date] = day;
          return next;
        });
        setNow(Date.now());
      }
    } finally { if (version.current === id) setLoading(false); }
  }
  const dateLabel = (date: string) => new Intl.DateTimeFormat(uk ? 'uk-UA' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Atlantic/Madeira' }).format(new Date(`${date}T12:00:00Z`));
  const stale = (day: TrailDay) => !day.checkedAt || now - Date.parse(day.checkedAt) >= 300000;
  const loaded = search?.dates.filter(date => !!days[date]).length ?? 0;
  const failed = search?.dates.filter(date => days[date]?.error).length ?? 0;
  const active = days[selected];
  const slots = active ? availableSlots(active, category, now) : [];
  const searchedTrail = trails.find(item => item.id === search?.route);
  const categories: [BookingCategory, string][] = [['visitor', t('Non-resident visitor', 'Відвідувач / нерезидент')], ['operator', t('Economic operator', 'Туроператор')], ['resident', t('Madeira resident', 'Резидент Мадейри')]];
  const today = now ? madeiraDate(new Date(now)) : initialDate;
  return <Layout><Head>
    <title>{title} | Madeira Live Cams</title><meta name="description" content={description} />
    <meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" /><meta name="twitter:title" content={title} /><meta name="twitter:description" content={description} />
  </Head><div className={`page-shell ${styles.page}`}>
    <section className={styles.hero}><div className={styles.eyebrow}>{t('MADEIRA · GROUP PLANNING', 'МАДЕЙРА · ПЛАНУВАННЯ ДЛЯ ГРУП')}</div><h1>{title}</h1><p>{t('Your group. Your dates. Find the right time slot.', 'Ваша група. Ваші дати. Знайдіть зручний тайм-слот.')}</p></section>
    <form className={styles.filters} onSubmit={load}>
      <div className={styles.fields} style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <label>{t('Walking route', 'Маршрут')}<select value={route} onChange={event => { reset(); setRoute(event.target.value); }} disabled={!trails.length}>{!trails.length && <option value="">{t('Routes unavailable', 'Маршрути недоступні')}</option>}{trails.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>{t('Booking category', 'Категорія бронювання')}<select value={category} onChange={event => setCategory(event.target.value as BookingCategory)}>{categories.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      </div>
      <div className={styles.shortcuts}><span>{t('From today:', 'Від сьогодні:')}</span>{[7, 14, 30, 60].map(count => <button key={count} type="button" aria-pressed={period === count} onClick={() => { reset(); setPeriod(count); }}>{count} {t('days', 'днів')}</button>)}</div>
      <div className={styles.filterBottom}><span className={styles.source}>{dateLabel(today)} – {dateLabel(addDays(today, period - 1))}</span><button className={styles.primary} disabled={!route || loading}>{loading ? t('Checking…', 'Перевіряємо…') : t('Show time slots →', 'Показати тайм-слоти →')}</button></div>
    </form>
    <section className={styles.results}>
      <div className={styles.resultHeading}><h2>{searchedTrail?.name || t('Available time slots', 'Доступні тайм-слоти')}</h2><a className={styles.secondary} href={`${BOOKING_URL}/start`} target="_blank" rel="noopener noreferrer">{t('Book on SIMplifica ↗', 'Бронювати в SIMplifica ↗')}</a></div>
      <div role="status" aria-live="polite">{search && <p className={styles.progress}>{t('Days checked:', 'Перевірено днів:')} {loaded}/{search.dates.length}{loading ? '…' : ''}{failed > 0 && ` · ${t('Unavailable:', 'Без даних:')} ${failed}`}</p>}{catalogUnavailable && <p className={styles.error}>{t('SIMplifica route list is unavailable. Reload or open the official portal.', 'Перелік маршрутів SIMplifica недоступний. Оновіть сторінку або відкрийте офіційний портал.')}</p>}</div>
      {!search && <p className={styles.empty}>{t('Choose a route and period, then show time slots.', 'Оберіть маршрут і період та натисніть «Показати тайм-слоти».')}</p>}
      {search && <>
        <div className={styles.days} aria-label={t('Select day', 'Оберіть день')}>{search.dates.map(date => {
          const day = days[date];
          const count = day && !day.error ? availableSlots(day, category, now).length : null;
          const unknown = day && !day.error && (!day.slots.length || day.slots.some(slot => slot.percentages[category] === null));
          const label = !day ? t('Waiting', 'Очікуємо') : day.error ? t('No data', 'Без даних') : stale(day) ? t('Refresh needed', 'Час оновити') : unknown && !count ? t('Unknown', 'Невідомо') : timeSlotLabel(count ?? 0, uk);
          return <button type="button" key={date} aria-pressed={date === selected} className={`${styles.day} ${date === selected ? styles.selectedDay : ''}`} onClick={() => setSelected(date)}><span>{dateLabel(date)}</span><strong>{count === null || (unknown && !count) ? '—' : count}</strong><small>{label}</small></button>;
        })}</div>
        <div className={styles.dayHeading}><h3>{dateLabel(selected)}</h3><p>{active?.checkedAt ? `${t('Checked', 'Перевірено')} ${new Intl.DateTimeFormat(uk ? 'uk-UA' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Atlantic/Madeira' }).format(new Date(active.checkedAt))}` : t('No verified data yet', 'Перевірених даних ще немає')}</p></div>
        {!active ? <p className={styles.empty}>{t('This date is waiting to be checked.', 'Ця дата очікує перевірки.')}</p> : active.error ? <p className={styles.error}>{t('Could not check this date. Run the search again.', 'Не вдалося перевірити цю дату. Запустіть пошук ще раз.')}</p> : <>
          {stale(active) && <p className={styles.error}>{t('Data is more than five minutes old. Refresh the search.', 'Даним понад п’ять хвилин. Оновіть пошук.')}</p>}
          {!slots.length && <p className={styles.empty}>{active.slots.length && active.slots.every(slot => slot.percentages[category] !== null) ? t('No available future time slots for this category on this day. Choose another date.', 'На цей день немає доступних майбутніх тайм-слотів для цієї категорії. Оберіть іншу дату.') : t('Availability could not be confirmed for this date. Try again or check SIMplifica.', 'Доступність на цю дату не підтверджена. Повторіть пошук або перевірте SIMplifica.')}</p>}
          <div className={styles.slots} aria-label={t('Available time slots', 'Доступні тайм-слоти')}>{slots.map(slot => <article key={slot.start} className={styles.slot}><div className={styles.slotTop}><strong>{slot.start} <span>– {slot.end}</span></strong><span className={styles.percent}>{t('Available', 'Є місця')}</span></div></article>)}</div>
        </>}
      </>}
    </section>
    <p className={styles.source}>{t('Source:', 'Джерело:')} <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">SIMplifica / IFCN</a> · {t('Madeira local time', 'Місцевий час Мадейри')}</p>
  </div></Layout>;
}
