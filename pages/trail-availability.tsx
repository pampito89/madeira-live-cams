import { FormEvent, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import TrailGroupCalculator from '../components/TrailGroupCalculator';
import { useMessages } from '../lib/i18n/useMessages';
import { addDays, AvailabilityResult, BOOKING_URL, BookingCategory, madeiraDate, Trail, TrailDay, validDate } from '../lib/trailAvailability';
import { planningDates, weekStarts } from '../lib/trailPlanning';
import { availableSlots, timeSlotLabel } from '../lib/trailBooking';
import styles from '../styles/trailAvailability.module.css';

type Props = { trails: Trail[]; initialDate: string; catalogUnavailable: boolean };
type Search = { route: number; dates: string[] };
// The public portal router supports /start. It starts the official application;
// its startProcess handler does not accept route, date, time or party parameters.
const BOOKING_START_URL = `${BOOKING_URL}/start`;
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
  const [start, setStart] = useState(initialDate);
  const [end, setEnd] = useState(addDays(initialDate, 29));
  const [people, setPeople] = useState('14');
  const [category, setCategory] = useState<BookingCategory>('visitor');
  const [split, setSplit] = useState(false);
  const [gap, setGap] = useState('30');
  const [search, setSearch] = useState<Search | null>(null);
  const [days, setDays] = useState<Record<string, TrailDay>>({});
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');
  const [chosen, setChosen] = useState<{ context: string; time: string } | null>(null);
  const [copied, setCopied] = useState<{ key: string; message: string } | null>(null);
  const [now, setNow] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const version = useRef(0);
  const title = t('Trail availability', 'Завантаженість маршрутів');
  const description = t('Find available Madeira PR trail time slots for your travel dates and plan a group visit using SIMplifica data.', 'Знаходьте доступні тайм-слоти маршрутів PR на Мадейрі на ваші дати та плануйте відвідування групою за даними SIMplifica.');
  const dates = planningDates(start, end);
  const size = Number(people);
  const validPeople = Number.isInteger(size) && size >= 1 && size <= 100;
  const validRange = dates.length > 0 && start >= initialDate && end <= addDays(initialDate, 90);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => { window.clearInterval(timer); controller.current?.abort(); };
  }, []);
  function reset() {
    version.current += 1; controller.current?.abort(); setLoading(false); setSearch(null); setDays({}); setChosen(null); setCopied(null);
  }
  function changeStart(value: string) {
    reset(); setStart(value);
    if (validDate(value)) setEnd(addDays(value, Math.max(1, dates.length || 30) - 1));
  }
  async function load(event: FormEvent) {
    event.preventDefault();
    if (!route || !validRange || !validPeople) return;
    controller.current?.abort();
    const abort = new AbortController(); controller.current = abort;
    const id = ++version.current;
    const requested = [...dates];
    setSearch({ route: Number(route), dates: requested }); setDays({}); setSelected(start); setChosen(null); setCopied(null); setLoading(true);
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
  const context = `${search?.route}/${selected}/${category}/${people}`;
  const selectedSlot = chosen?.context === context ? slots.find(slot => slot.start === chosen.time) : undefined;
  const categories: [BookingCategory, string][] = [['visitor', t('Non-resident visitor', 'Відвідувач / нерезидент')], ['operator', t('Economic operator', 'Туроператор')], ['resident', t('Madeira resident', 'Резидент Мадейри')]];
  const bookingText = searchedTrail && selectedSlot ? `${searchedTrail.name}\n${selected} · ${selectedSlot.start}–${selectedSlot.end} · Madeira\n${size} ${t('people', 'людей')} · ${categories.find(([id]) => id === category)?.[1]}\n${t('Planning only. Not booked.', 'План відвідування. Ще не заброньовано.')}` : '';
  async function copyBooking() {
    if (!bookingText) return;
    try { await navigator.clipboard.writeText(bookingText); setCopied({ key: bookingText, message: t('Booking details copied.', 'Дані для бронювання скопійовано.') }); }
    catch { setCopied({ key: bookingText, message: t('Could not copy. Select the details below and copy them manually.', 'Не вдалося скопіювати. Виділіть дані нижче та скопіюйте вручну.') }); }
  }
  return <Layout><Head>
    <title>{title} | Madeira Live Cams</title><meta name="description" content={description} />
    <meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" /><meta name="twitter:title" content={title} /><meta name="twitter:description" content={description} />
  </Head><div className={`page-shell ${styles.page}`}>
    <section className={styles.hero}><div className={styles.eyebrow}>{t('MADEIRA · GROUP PLANNING', 'МАДЕЙРА · ПЛАНУВАННЯ ДЛЯ ГРУП')}</div><h1>{title}</h1><p>{t('Your group. Your dates. Find the right time slot.', 'Ваша група. Ваші дати. Знайдіть зручний тайм-слот.')}</p><div className={styles.heroMeta}><span>SIMplifica</span><span>{t('Up to 30 days at a time', 'До 30 днів за один пошук')}</span><span>{t('Madeira local time', 'Місцевий час Мадейри')}</span></div></section>
    <form className={styles.filters} onSubmit={load}><div className={styles.fields}>
      <label className={styles.routeField}>{t('Walking route', 'Маршрут')}<select value={route} onChange={event => { reset(); setRoute(event.target.value); }} disabled={!trails.length}>{!trails.length && <option value="">{t('Routes unavailable', 'Маршрути недоступні')}</option>}{trails.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>{t('Arrival / from', 'Приїзд / від')}<input type="date" value={start} min={initialDate} max={addDays(initialDate, 90)} onChange={event => changeStart(event.target.value)} required /></label>
      <label>{t('Departure / through', 'Від’їзд / до включно')}<input type="date" value={end} min={start} max={validDate(start) ? [addDays(start, 29), addDays(initialDate, 90)].sort()[0] : undefined} onChange={event => { reset(); setEnd(event.target.value); }} required /></label>
      <label>{t('People', 'Людей у групі')}<input type="number" min="1" max="100" step="1" value={people} onChange={event => setPeople(event.target.value)} required /></label>
      <label>{t('Booking category', 'Категорія бронювання')}<select value={category} onChange={event => { setCategory(event.target.value as BookingCategory); setChosen(null); }}>{categories.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
    </div><div className={styles.shortcuts}><span>{t('Period:', 'Період:')}</span>{[7, 14, 30].map(count => <button key={count} type="button" aria-pressed={dates.length === count} disabled={!validDate(start) || addDays(start, count - 1) > addDays(initialDate, 90)} onClick={() => { reset(); setEnd(addDays(start, count - 1)); }}>{count} {t('days', 'днів')}</button>)}<button type="button" onClick={() => changeStart(addDays(initialDate, 14))}>{t('Arriving in two weeks', 'Приїзд через два тижні')}</button></div>
    {!validRange && <p className={styles.error}>{t('Choose 1–30 days within the next 90 days.', 'Оберіть від 1 до 30 днів у межах наступних 90 днів.')}</p>}
    <div className={styles.filterBottom}><div><label className={styles.checkbox}><input type="checkbox" checked={split} onChange={event => setSplit(event.target.checked)} />{t('Allow subgroups to enter in different time slots', 'Дозволити розподіл групи між тайм-слотами')}</label>{split && <label className={styles.gap}>{t('Maximum gap between starts', 'Максимальний проміжок між стартами')}<select value={gap} onChange={event => setGap(event.target.value)}>{[30, 60, 90].map(n => <option key={n} value={n}>{n} {t('min', 'хв')}</option>)}</select></label>}</div><button className={styles.primary} disabled={!route || !validRange || !validPeople || loading}>{loading ? t('Checking dates…', 'Перевіряємо дати…') : t('Check selected dates →', 'Перевірити обрані дати →')}</button></div></form>
    <aside className={styles.notice}><strong>{t('Available time slots only', 'Лише доступні тайм-слоти')}</strong><p>{t('The calendar counts time slots with available places for your booking category. Exact seat counts for the whole group must be checked on SIMplifica.', 'Число в календарі — кількість тайм-слотів із вільними місцями для вашої категорії. Чи вистачить місць для всієї групи, потрібно перевірити в SIMplifica.')}</p></aside>
    <section className={styles.results}><div className={styles.resultHeading}><div><div className={styles.eyebrow}>{t('YOUR PLANNING CALENDAR', 'ВАШ КАЛЕНДАР ПЛАНУВАННЯ')}</div><h2>{searchedTrail?.name || t('Choose your dates', 'Оберіть ваші дати')}</h2></div><span className={styles.groupBadge}>{validPeople ? size : '—'} {t('people', 'людей')}</span></div>
    <div role="status" aria-live="polite">{search && <p className={styles.progress}>{t('Days checked:', 'Перевірено днів:')} {loaded}/{search.dates.length}{loading ? '…' : ''}{failed > 0 && ` · ${t('Unavailable:', 'Без даних:')} ${failed}`}</p>}{catalogUnavailable && <p className={styles.error}>{t('SIMplifica route list is unavailable. Reload or open the official portal.', 'Перелік маршрутів SIMplifica недоступний. Оновіть сторінку або відкрийте офіційний портал.')}</p>}</div>
    {!search && <p className={styles.empty}>{t('Select your travel dates and check the calendar.', 'Оберіть дати перебування та перевірте календар.')}</p>}
    {search && <>
      <div className={styles.days} aria-label={t('Select day', 'Оберіть день')}>{search.dates.map(date => {
        const day = days[date];
        const count = day && !day.error ? availableSlots(day, category, now).length : null;
        const unknown = day && !day.error && (!day.slots.length || day.slots.some(slot => slot.percentages[category] === null));
        const label = !day ? t('Waiting', 'Очікуємо') : day.error ? t('No data', 'Без даних') : stale(day) ? t('Refresh needed', 'Час оновити') : unknown && !count ? t('Unknown', 'Невідомо') : timeSlotLabel(count ?? 0, uk);
        return <button type="button" key={date} aria-pressed={date === selected} className={`${styles.day} ${date === selected ? styles.selectedDay : ''}`} onClick={() => { setSelected(date); setChosen(null); }}><span>{dateLabel(date)}</span><strong>{count === null || (unknown && !count) ? '—' : count}</strong><small>{label}</small></button>;
      })}</div>
      <div className={styles.dayHeading}><div><h3>{dateLabel(selected)}</h3><p>{active?.checkedAt ? `${t('Checked', 'Перевірено')} ${new Intl.DateTimeFormat(uk ? 'uk-UA' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Atlantic/Madeira' }).format(new Date(active.checkedAt))}` : t('No verified data yet', 'Перевірених даних ще немає')}</p></div></div>
      {!active ? <p className={styles.empty}>{t('This date is waiting to be checked.', 'Ця дата очікує перевірки.')}</p> : active.error ? <p className={styles.error}>{t('Could not check this date. Run the search again.', 'Не вдалося перевірити цю дату. Запустіть пошук ще раз.')}</p> : <>
        {stale(active) && <p className={styles.error}>{t('Data is more than five minutes old. Refresh before planning.', 'Даним понад п’ять хвилин. Оновіть пошук перед плануванням.')}</p>}
        {!slots.length && <p className={styles.empty}>{active.slots.length && active.slots.every(slot => slot.percentages[category] !== null) ? t('No available future time slots for this category on this day. Choose another date.', 'На цей день немає доступних майбутніх тайм-слотів для цієї категорії. Оберіть іншу дату.') : t('Availability could not be confirmed for this date. Try again or check SIMplifica.', 'Доступність на цю дату не підтверджена. Повторіть пошук або перевірте SIMplifica.')}</p>}
        <div className={styles.slots} aria-label={t('Available time slots', 'Доступні тайм-слоти')}>{slots.map(slot => <article key={slot.start} className={`${styles.slot} ${selectedSlot?.start === slot.start ? styles.chosenSlot : ''}`}><div className={styles.slotTop}><strong>{slot.start} <span>– {slot.end}</span></strong><span className={styles.percent}>{t('Available', 'Є місця')}</span></div><p>{t('Places for the whole group need confirmation.', 'Місця для всієї групи потрібно підтвердити.')}</p><button className={styles.secondary} type="button" aria-pressed={selectedSlot?.start === slot.start} aria-label={`${t('Select time slot', 'Обрати тайм-слот')} ${slot.start}`} disabled={!validPeople || stale(active)} onClick={() => setChosen({ context, time: slot.start })}>{selectedSlot?.start === slot.start ? t('Selected', 'Обрано') : t('Select this time', 'Обрати цей час')}</button></article>)}</div>
        {!!slots.length && <TrailGroupCalculator key={`${search.route}/${selected}/${category}`} day={active} category={category} people={size} split={split} gap={Number(gap)} now={now} ukrainian={uk} routeName={searchedTrail?.name ?? ''} />}
      </>}
    </>}
    </section>
    <section className={styles.booking}>
      <div><h2>{t('Continue with your booking', 'Перейти до оформлення')}</h2>
        {bookingText ? <><pre className={styles.bookingSummary}>{bookingText}</pre>{active && stale(active) && <p>{t('Refresh availability before booking.', 'Оновіть доступність перед бронюванням.')}</p>}</> : <p>{t('Select a time slot above to prepare the details for your booking.', 'Оберіть тайм-слот вище, щоб підготувати дані для бронювання.')}</p>}
        <p>{t('The button starts the official SIMplifica application, skipping the information page. Choose the route, date, time and people there; these details are not filled automatically.', 'Кнопка запускає оформлення заявки в SIMplifica, пропускаючи інформаційну сторінку. Маршрут, дату, час і кількість людей потрібно вибрати там — ці дані автоматично не заповнюються.')}</p>
        <p>{t('If the direct start does not open, use the', 'Якщо оформлення не відкриється, скористайтеся')} <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">{t('service page', 'сторінкою послуги')}</a>.</p>
        {copied?.key === bookingText && <p role="status">{copied.message}</p>}
      </div>
      <div className={styles.bookingActions}>{bookingText && <button className={styles.secondary} type="button" onClick={copyBooking}>{t('Copy booking details', 'Копіювати дані бронювання')}</button>}<a className={styles.primary} href={BOOKING_START_URL} target="_blank" rel="noopener noreferrer">{t('Start on SIMplifica ↗', 'Почати оформлення ↗')}</a></div>
    </section>
    <p className={styles.source}>{t('Source:', 'Джерело:')} <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">SIMplifica / IFCN</a>. {t('Booking availability does not confirm trail safety or opening status.', 'Доступність бронювання не підтверджує безпеку чи відкриття маршруту.')}</p>
  </div></Layout>;
}
