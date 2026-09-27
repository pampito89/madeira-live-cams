import { FormEvent, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import { useMessages } from '../lib/i18n/useMessages';
import { addDays, allocateGroup, AvailabilityResult, BOOKING_URL, BookingCategory, madeiraDate, SeatEntry, Trail, TrailDay, validDate } from '../lib/trailAvailability';
import { planningDates, weekStarts } from '../lib/trailPlanning';
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
  const t = (en: string, uk: string) => locale === 'uk' ? uk : en;
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
  const [entries, setEntries] = useState<Record<string, SeatEntry>>({});
  const [now, setNow] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const version = useRef(0);
  const title = t('Trail availability', 'Завантаженість маршрутів');
  const description = t('Plan a Madeira PR trail visit up to 30 days at a time. Compare future entry slots using current SIMplifica availability.', 'Плануйте відвідування маршрутів PR на Мадейрі на період до 30 днів. Порівнюйте майбутні слоти за поточними даними SIMplifica.');
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
    version.current += 1; controller.current?.abort(); setLoading(false); setSearch(null); setDays({}); setEntries({});
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
    setSearch({ route: Number(route), dates: requested }); setDays({}); setEntries({}); setSelected(start); setLoading(true);
    try {
      // Sequential weekly requests reuse the existing bounded, cached server reader.
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
  const dateLabel = (date: string) => new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Atlantic/Madeira' }).format(new Date(`${date}T12:00:00Z`));
  const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Atlantic/Madeira' }).format(new Date(now || Date.now()));
  const today = madeiraDate(new Date(now || Date.now()));
  const future = (day: TrailDay) => day.slots.filter(slot => day.date > today || (day.date === today && slot.start > clock));
  const positive = (day: TrailDay) => future(day).filter(slot => (slot.percentages[category] ?? 0) > 0);
  const stale = (day: TrailDay) => !day.checkedAt || now - Date.parse(day.checkedAt) >= 300000;
  const dayPlans = (day: TrailDay) => validPeople && !day.error && !stale(day) ? allocateGroup(future(day).filter(slot => slot.percentages[category] !== 0), entries, size, split, Number(gap), now) : [];
  const loaded = search?.dates.filter(date => !!days[date]).length ?? 0;
  const failed = search?.dates.filter(date => days[date]?.error).length ?? 0;
  const promising = search?.dates.filter(date => days[date] && !days[date].error && !stale(days[date]) && positive(days[date]).length > 0) ?? [];
  const confirmed = search?.dates.filter(date => days[date] && dayPlans(days[date]).length > 0) ?? [];
  const active = days[selected];
  const slots = active ? future(active) : [];
  const plans = active ? dayPlans(active) : [];
  const categories: [BookingCategory, string][] = [['visitor', t('Non-resident visitor', 'Відвідувач / нерезидент')], ['operator', t('Economic operator', 'Туроператор')], ['resident', t('Madeira resident', 'Резидент Мадейри')]];
  return <Layout><Head>
    <title>{title} | Madeira Live Cams</title><meta name="description" content={description} />
    <meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" /><meta name="twitter:title" content={title} /><meta name="twitter:description" content={description} />
  </Head><div className={`page-shell ${styles.page}`}>
    <section className={styles.hero}><div className={styles.eyebrow}>{t('MADEIRA · GROUP PLANNING', 'МАДЕЙРА · ПЛАНУВАННЯ ДЛЯ ГРУП')}</div><h1>{title}</h1><p>{t('Your group. Your dates. Find the right entry time.', 'Ваша група. Ваші дати. Знайдіть зручний час входу.')}</p><div className={styles.heroMeta}><span>SIMplifica</span><span>{t('Up to 30 days at a time', 'До 30 днів за один пошук')}</span><span>{t('Madeira local time', 'Місцевий час Мадейри')}</span></div></section>
    <form className={styles.filters} onSubmit={load}><div className={styles.fields}>
      <label className={styles.routeField}>{t('Walking route', 'Маршрут')}<select value={route} onChange={e => { reset(); setRoute(e.target.value); }} disabled={!trails.length}>{!trails.length && <option value="">{t('Routes unavailable', 'Маршрути недоступні')}</option>}{trails.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>{t('Arrival / from', 'Приїзд / від')}<input type="date" value={start} min={initialDate} max={addDays(initialDate, 90)} onChange={e => changeStart(e.target.value)} required /></label>
      <label>{t('Departure / through', 'Від’їзд / до включно')}<input type="date" value={end} min={start} max={validDate(start) ? [addDays(start, 29), addDays(initialDate, 90)].sort()[0] : undefined} onChange={e => { reset(); setEnd(e.target.value); }} required /></label>
      <label>{t('People', 'Людей у групі')}<input type="number" min="1" max="100" step="1" value={people} onChange={e => setPeople(e.target.value)} required /></label>
      <label>{t('Booking category', 'Категорія бронювання')}<select value={category} onChange={e => { setCategory(e.target.value as BookingCategory); setEntries({}); }}>{categories.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
    </div><div className={styles.shortcuts}><span>{t('Period:', 'Період:')}</span>{[7, 14, 30].map(count => <button key={count} type="button" aria-pressed={dates.length === count} disabled={!validDate(start) || addDays(start, count - 1) > addDays(initialDate, 90)} onClick={() => { reset(); setEnd(addDays(start, count - 1)); }}>{count} {t('days', 'днів')}</button>)}<button type="button" onClick={() => changeStart(addDays(initialDate, 14))}>{t('Arriving in two weeks', 'Приїзд через два тижні')}</button></div>
    {!validRange && <p className={styles.error}>{t('Choose 1–30 days within the next 90 days.', 'Оберіть від 1 до 30 днів у межах наступних 90 днів.')}</p>}
    <div className={styles.filterBottom}><div><label className={styles.checkbox}><input type="checkbox" checked={split} onChange={e => setSplit(e.target.checked)} />{t('Allow different entry slots', 'Дозволити розподіл групи між слотами')}</label>{split && <label className={styles.gap}>{t('Maximum gap between starts', 'Максимальний проміжок між стартами')}<select value={gap} onChange={e => setGap(e.target.value)}>{[30, 60, 90].map(n => <option key={n} value={n}>{n} {t('min', 'хв')}</option>)}</select></label>}</div><button className={styles.primary} disabled={!route || !validRange || !validPeople || loading}>{loading ? t('Checking dates…', 'Перевіряємо дати…') : t('Check selected dates →', 'Перевірити обрані дати →')}</button></div></form>
    <aside className={styles.notice}><strong>{t('Current availability for future dates — not a forecast.', 'Поточна доступність на майбутні дати — не прогноз.')}</strong><p>{t('Percentages do not tell us how many seats remain. A positive slot is a date to check, not confirmation of space for your whole group. Enter exact counts you have verified to calculate a group split.', 'Відсотки не показують точний залишок місць. Слот понад 0% — привід перевірити дату, а не підтвердження місць для всієї групи. Для розрахунку розподілу введіть точні залишки, які ви перевірили.')}</p></aside>
    <section className={styles.results}><div className={styles.resultHeading}><div><div className={styles.eyebrow}>{t('YOUR PLANNING CALENDAR', 'ВАШ КАЛЕНДАР ПЛАНУВАННЯ')}</div><h2>{trails.find(item => item.id === search?.route)?.name || t('Choose your dates', 'Оберіть ваші дати')}</h2></div><span className={styles.groupBadge}>{validPeople ? size : '—'} {t('people', 'людей')}</span></div>
    <div role="status" aria-live="polite">{search && <p className={styles.progress}>{t('Days checked:', 'Перевірено днів:')} {loaded}/{search.dates.length}{loading ? '…' : ''}{failed > 0 && ` · ${t('Unavailable:', 'Без даних:')} ${failed}`}</p>}{catalogUnavailable && <p className={styles.error}>{t('SIMplifica route list is unavailable. Reload or open the official portal.', 'Перелік маршрутів SIMplifica недоступний. Оновіть сторінку або відкрийте офіційний портал.')}</p>}</div>
    {!search && <p className={styles.empty}>{t('Select your travel dates and check the calendar. Start with a month, or narrow the search to the week your group is on Madeira.', 'Оберіть дати перебування та перевірте календар. Почніть із місяця або звузьте пошук до тижня, коли ваша група на Мадейрі.')}</p>}
    {search && <><div className={styles.recommendations}><strong>{t('First dates to check', 'Найближчі дати для перевірки')}</strong><p>{t('At least one slot above 0%. Group capacity still needs confirmation.', 'Є хоча б один слот понад 0%. Місткість для групи ще потребує підтвердження.')}</p><div className={styles.shortcuts}>{promising.slice(0, 5).map(date => <button type="button" key={date} onClick={() => setSelected(date)}>{dateLabel(date)} · {positive(days[date])[0].start}</button>)}</div>{!promising.length && <p>{loading ? t('Checking the selected period…', 'Перевіряємо обраний період…') : t('No fresh positive slots found in the returned data.', 'У отриманих актуальних даних немає слотів понад 0%.')}</p>}{confirmed.length > 0 && <><strong>{t('Group fits based on your counts', 'Група поміщається за вашими даними')}</strong><div className={styles.shortcuts}>{confirmed.map(date => <button type="button" key={date} onClick={() => setSelected(date)}>{dateLabel(date)}</button>)}</div></>}</div>
    <div className={styles.days} aria-label={t('Select day', 'Оберіть день')}>{search.dates.map(date => {
      const day = days[date];
      const count = day && !day.error ? positive(day).length : null;
      const unknown = day && !day.error && (future(day).length === 0 || future(day).some(slot => slot.percentages[category] === null));
      const label = !day ? t('Waiting', 'Очікуємо') : day.error ? t('No data', 'Без даних') : stale(day) ? t('Refresh needed', 'Час оновити') : unknown && !count ? t('Unknown', 'Невідомо') : t('slots above 0%', 'слотів понад 0%');
      return <button type="button" key={date} aria-pressed={date === selected} className={`${styles.day} ${date === selected ? styles.selectedDay : ''}`} onClick={() => setSelected(date)}><span>{dateLabel(date)}</span><strong>{count === null || (unknown && !count) ? '—' : count}</strong><small>{label}</small>{day && dayPlans(day).length > 0 && <small>✓ {size} {t('people', 'людей')}</small>}</button>;
    })}</div>
    <div className={styles.dayHeading}><div><h3>{dateLabel(selected)}</h3><p>{active?.checkedAt ? `${t('Checked', 'Перевірено')} ${new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Atlantic/Madeira' }).format(new Date(active.checkedAt))}` : t('No verified data yet', 'Перевірених даних ще немає')}</p></div></div>
    {!active ? <p className={styles.empty}>{t('This date is waiting to be checked.', 'Ця дата очікує перевірки.')}</p> : active.error ? <p className={styles.error}>{t('Could not check this date. Run the search again.', 'Не вдалося перевірити цю дату. Запустіть пошук ще раз.')}</p> : <>{stale(active) && <p className={styles.error}>{t('Data is more than five minutes old. Refresh before planning.', 'Даним понад п’ять хвилин. Оновіть пошук перед плануванням.')}</p>}{!slots.length && <p className={styles.empty}>{t('No future slots returned. This does not confirm closure or a sold-out day.', 'Майбутніх слотів не отримано. Це не підтверджує закриття або відсутність місць.')}</p>}<div className={styles.slots}>{slots.map(slot => <article key={slot.start} className={`${styles.slot} ${slot.percentages[category] === 0 ? styles.zeroSlot : ''}`}><div className={styles.slotTop}><strong>{slot.start} <span>– {slot.end}</span></strong><span className={styles.percent}>{slot.percentages[category] === null ? '—' : `${slot.percentages[category]}%`}</span></div><p>{t('Group capacity not confirmed', 'Місткість для групи не підтверджено')}</p></article>)}</div>
    {!!slots.length && <details className={styles.manual}><summary>{t('Calculate using exact seat counts you checked', 'Розрахувати за перевіреною вами кількістю місць')}</summary><p>{t('Counts expire after five minutes and clear on a new search or category change. Nothing is reserved.', 'Числа діють п’ять хвилин і скидаються після нового пошуку або зміни категорії. Це не резервує місця.')}</p><div className={styles.seatInputs}>{slots.filter(slot => slot.percentages[category] !== 0).map(slot => { const key = `${slot.date}/${slot.start}`; return <label key={key}>{slot.start}<input aria-label={`${t('Checked remaining seats at', 'Перевірений залишок о')} ${slot.start}`} type="number" min="0" max="10000" step="1" placeholder="—" value={entries[key]?.seats ?? ''} onChange={e => { const raw = e.target.value; const value = Number(raw); setEntries(previous => { const next = { ...previous }; if (!raw || !Number.isInteger(value) || value < 0 || value > 10000) delete next[key]; else next[key] = { seats: value, checkedAt: Date.now() }; return next; }); setNow(Date.now()); }} /></label>; })}</div><div className={styles.plans} aria-live="polite"><h4>{t('Plans based on your counts', 'Варіанти за вашими даними')}</h4>{!plans.length && <p>{t('No group fit confirmed. Add checked counts, allow splitting or choose another date.', 'Розміщення групи не підтверджено. Додайте перевірені числа, дозвольте розподіл або оберіть іншу дату.')}</p>}{plans.slice(0, 6).map((plan, index) => <div key={index} className={styles.plan}><strong>{plan.length === 1 ? t('Together', 'Разом') : `${plan.length} ${t('slots', 'слоти')}`}</strong><span>{plan.map(item => `${item.start} — ${item.people} ${t('people', 'людей')}`).join(' + ')}</span></div>)}{split && <p>{t('Each subgroup must enter at its booked time. Separate bookings do not reserve the whole group at once.', 'Кожна підгрупа має входити у свій заброньований час. Окремі бронювання не резервують усю групу одночасно.')}</p>}</div></details>}</>}
    </>}
    </section><section className={styles.booking}><div><h2>{t('Continue on SIMplifica', 'Перейти до SIMplifica')}</h2>{search && <p><strong>{trails.find(item => item.id === search.route)?.name} · {dateLabel(selected)} · {size} {t('people', 'людей')}</strong></p>}<p>{t('Select the route, date, time and group size on the official portal. These settings are not transferred automatically. Final availability is confirmed there.', 'Оберіть маршрут, дату, час і кількість людей на офіційному порталі. Параметри не переносяться автоматично. Остаточна доступність підтверджується там.')}</p></div><a className={styles.primary} href={BOOKING_URL} target="_blank" rel="noopener noreferrer">{t('Open booking portal ↗', 'Відкрити бронювання ↗')}</a></section><p className={styles.source}>{t('Source:', 'Джерело:')} <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">SIMplifica / IFCN</a>. {t('Booking availability does not confirm trail safety or opening status.', 'Доступність бронювання не підтверджує безпеку чи відкриття маршруту.')}</p>
  </div></Layout>;
}
