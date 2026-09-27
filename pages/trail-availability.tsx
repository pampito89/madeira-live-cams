import { FormEvent, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import { useMessages } from '../lib/i18n/useMessages';
import { addDays, allocateGroup, AvailabilityResult, BOOKING_URL, BookingCategory, madeiraDate, SeatEntry, Trail, TrailDay, validDate } from '../lib/trailAvailability';
import styles from '../styles/trailAvailability.module.css';

type Props = { trails: Trail[]; initialDate: string; catalogUnavailable: boolean };
type Search = { route: number; start: string };

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const { getTrails } = await import('../lib/simplifica');
  try { return { props: { trails: await getTrails(), initialDate: madeiraDate(), catalogUnavailable: false } }; }
  catch { return { props: { trails: [], initialDate: madeiraDate(), catalogUnavailable: true } }; }
};

export default function TrailAvailabilityPage({ trails, initialDate, catalogUnavailable }: Props) {
  const { locale } = useMessages();
  const uk = locale === 'uk';
  const t = (en: string, ua: string) => uk ? ua : en;
  const [route, setRoute] = useState(String(trails.find(trail => trail.id === 301)?.id ?? trails[0]?.id ?? ''));
  const [start, setStart] = useState(initialDate);
  const [people, setPeople] = useState('14');
  const [category, setCategory] = useState<BookingCategory>('visitor');
  const [split, setSplit] = useState(false);
  const [gap, setGap] = useState('30');
  const [search, setSearch] = useState<Search | null>(null);
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [entries, setEntries] = useState<Record<string, SeatEntry>>({});
  const [now, setNow] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const version = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const title = t('Trail availability', 'Завантаженість маршрутів');
  const description = t('Check Madeira PR trail time slots for the next seven days and plan a group visit using SIMplifica availability.', 'Перевіряйте доступність слотів маршрутів PR на Мадейрі на сім днів і плануйте відвідування групою за даними SIMplifica.');
  const groupSize = Number(people);
  const validPeople = Number.isInteger(groupSize) && groupSize >= 1 && groupSize <= 100;
  const validStart = validDate(start) && start >= initialDate && start <= addDays(initialDate, 90);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => { window.clearInterval(timer); controller.current?.abort(); };
  }, []);

  function resetResults() {
    version.current += 1;
    controller.current?.abort();
    setLoading(false); setResult(null); setSearch(null); setError(false); setEntries({});
  }

  async function loadWeek(event: FormEvent) {
    event.preventDefault();
    if (!route || !validStart || !validPeople) return;
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    const requestId = ++version.current;
    setLoading(true); setError(false); setResult(null); setEntries({}); setSearch({ route: Number(route), start }); setSelected(start);
    try {
      const response = await fetch(`/api/trail-availability?route=${encodeURIComponent(route)}&start=${encodeURIComponent(start)}`, { signal: abort.signal });
      if (!response.ok) throw new Error('Source unavailable');
      const data: AvailabilityResult = await response.json();
      if (version.current !== requestId) return;
      setResult(data); setNow(Date.now());
      const first = data.days.find(day => day.slots.some(slot => (slot.percentages[category] ?? 0) > 0));
      setSelected(first?.date ?? start);
      heading.current?.focus();
    } catch {
      if (!abort.signal.aborted && version.current === requestId) setError(true);
    } finally { if (version.current === requestId) setLoading(false); }
  }

  const formatDate = (date: string) => new Intl.DateTimeFormat(uk ? 'uk-UA' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Atlantic/Madeira' }).format(new Date(`${date}T12:00:00Z`));
  const formatChecked = (date: string) => new Intl.DateTimeFormat(uk ? 'uk-UA' : 'en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Atlantic/Madeira' }).format(new Date(date));
  const past = (day: TrailDay) => day.date === madeiraDate(new Date(now || Date.now()));
  const futureSlots = (day: TrailDay) => {
    const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Atlantic/Madeira', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(now || Date.now()));
    return day.slots.filter(slot => day.date >= madeiraDate(new Date(now || Date.now())) && (!past(day) || slot.start > clock));
  };
  const activeDay = result?.days.find(day => day.date === selected);
  const currentSlots = activeDay ? futureSlots(activeDay) : [];
  const shownSlots = currentSlots.filter(slot => !onlyAvailable || (slot.percentages[category] ?? 0) > 0);
  const plans = activeDay && validPeople ? allocateGroup(currentSlots.filter(slot => slot.percentages[category] !== 0), entries, groupSize, split, Number(gap), now) : [];
  const sourceStale = !!activeDay?.checkedAt && now - new Date(activeDay.checkedAt).getTime() > 5 * 60000;
  const searchedTrail = trails.find(trail => trail.id === search?.route);
  const categories: { id: BookingCategory; label: string }[] = [
    { id: 'visitor', label: t('Non-resident visitor', 'Відвідувач / нерезидент') },
    { id: 'operator', label: t('Economic operator', 'Туроператор') },
    { id: 'resident', label: t('Madeira resident', 'Резидент Мадейри') },
  ];

  return <Layout>
    <Head>
      <title>{title} | Madeira Live Cams</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${title} | Madeira Live Cams`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Head>
    <div className={`page-shell ${styles.page}`}>
      <section className={styles.hero}>
        <div className={styles.eyebrow}>{t('MADEIRA · PLAN YOUR WALK', 'МАДЕЙРА · ПЛАНУЙТЕ ПОХІД')}</div>
        <h1>{title}</h1>
        <p>{t('Find a day that works for your group.', 'Знайдіть день, що підходить вашій групі.')}</p>
        <div className={styles.heroMeta}><span>SIMplifica</span><span>{t('7-day calendar', 'Календар на 7 днів')}</span><span>{t('Madeira local time', 'Місцевий час Мадейри')}</span></div>
      </section>

      <form className={styles.filters} onSubmit={loadWeek}>
        <div className={styles.fields}>
          <label className={styles.routeField}>{t('Walking route', 'Маршрут')}
            <select value={route} onChange={event => { resetResults(); setRoute(event.target.value); }} disabled={!trails.length} required>
              {!trails.length && <option value="">{t('Route list unavailable', 'Перелік маршрутів недоступний')}</option>}
              {trails.map(trail => <option key={trail.id} value={trail.id}>{trail.name}</option>)}
            </select>
          </label>
          <label>{t('Starting from', 'Починаючи з')}<input type="date" value={start} min={initialDate} max={addDays(initialDate, 90)} onChange={event => { resetResults(); setStart(event.target.value); }} required /></label>
          <label>{t('People in your group', 'Людей у групі')}<input type="number" min="1" max="100" step="1" value={people} onChange={event => setPeople(event.target.value)} required /></label>
          <label>{t('Booking category', 'Категорія бронювання')}<select value={category} onChange={event => { setCategory(event.target.value as BookingCategory); setEntries({}); }}>{categories.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        </div>
        <div className={styles.filterBottom}>
          <div><label className={styles.checkbox}><input type="checkbox" checked={split} onChange={event => setSplit(event.target.checked)} />{t('Allow the group to use different entry slots', 'Дозволити розподіл групи між слотами')}</label>
            {split && <label className={styles.gap}>{t('Maximum gap between starts', 'Максимальний проміжок між стартами')}<select value={gap} onChange={event => setGap(event.target.value)}><option value="30">30 {t('min', 'хв')}</option><option value="60">60 {t('min', 'хв')}</option><option value="90">90 {t('min', 'хв')}</option></select></label>}
          </div>
          <button className={styles.primary} type="submit" disabled={loading || !trails.length || !validPeople || !validStart}>{loading ? t('Checking seven days…', 'Перевіряємо сім днів…') : t('Check availability →', 'Перевірити доступність →')}</button>
        </div>
      </form>

      <aside className={styles.notice}>
        <strong>{t('Availability percentages are not seat counts.', 'Відсоток доступності — це не кількість місць.')}</strong>
        <p>{t('SIMplifica publishes a separate percentage for each booking category. It does not expose an exact remaining seat count here, so we cannot automatically confirm space for your whole group. If you know the remaining seats, enter them below to calculate a split.', 'SIMplifica публікує окремий відсоток для кожної категорії. Точної кількості вільних місць це джерело не надає, тому автоматично підтвердити місця для всієї групи неможливо. Якщо ви знаєте залишок місць, введіть його нижче для розрахунку розподілу.')}</p>
      </aside>

      <section className={styles.results} aria-busy={loading}>
        <div className={styles.resultHeading}><div><div className={styles.eyebrow}>{t('YOUR NEXT SEVEN DAYS', 'ВАШІ НАСТУПНІ СІМ ДНІВ')}</div><h2 ref={heading} tabIndex={-1}>{searchedTrail?.name || t('Choose a route to get started', 'Оберіть маршрут для початку')}</h2></div><span className={styles.groupBadge}>{validPeople ? groupSize : '—'} {t('people', 'людей')}</span></div>
        <div role="status" aria-live="polite">
          {loading && <p className={styles.empty}>{t('Reading current availability from SIMplifica…', 'Отримуємо поточну доступність із SIMplifica…')}</p>}
          {(error || catalogUnavailable) && <p className={styles.error}>{t('SIMplifica is temporarily unavailable. Try again or check the official portal. No availability has been assumed.', 'SIMplifica тимчасово недоступна. Спробуйте ще раз або перевірте офіційний портал. Доступність місць не визначена.')}</p>}
          {!search && !catalogUnavailable && <p className={styles.empty}>{t('Choose a route, start date and group size, then check the week. The route list comes directly from the booking portal; a missing route does not mean it is closed.', 'Оберіть маршрут, початкову дату й розмір групи та перевірте тиждень. Перелік надходить із порталу бронювання; відсутність маршруту не означає, що його закрито.')}</p>}
        </div>
        {result && <>
          <div className={styles.days} aria-label={t('Select day', 'Оберіть день')}>
            {result.days.map(day => {
              const available = futureSlots(day).filter(slot => (slot.percentages[category] ?? 0) > 0).length;
              return <button key={day.date} type="button" aria-pressed={selected === day.date} className={`${styles.day} ${selected === day.date ? styles.selectedDay : ''}`} onClick={() => setSelected(day.date)}><span>{formatDate(day.date)}</span><strong>{day.error ? '—' : available}</strong><small>{day.error ? t('Not checked', 'Не перевірено') : t('slots above 0%', 'слотів понад 0%')}</small></button>;
            })}
          </div>
          {activeDay && <>
            <div className={styles.dayHeading}><div><h3>{formatDate(activeDay.date)}</h3><p>{activeDay.checkedAt ? `${t('Checked', 'Перевірено')} ${formatChecked(activeDay.checkedAt)} · ${t('Madeira time', 'час Мадейри')}` : t('No verified data for this day', 'Немає перевірених даних на цей день')}</p></div><label className={styles.checkbox}><input type="checkbox" checked={onlyAvailable} onChange={event => setOnlyAvailable(event.target.checked)} />{t('Only above 0%', 'Лише понад 0%')}</label></div>
            {sourceStale && <p className={styles.error}>{t('These results are over five minutes old. Check availability again before planning.', 'Цим результатам понад п’ять хвилин. Оновіть доступність перед плануванням.')}</p>}
            {activeDay.error ? <p className={styles.empty}>{t('Could not check this day. Retry the search.', 'Не вдалося перевірити цей день. Повторіть пошук.')}</p> : !shownSlots.length ? <p className={styles.empty}>{t('No matching future slots were returned. This is not confirmation that the trail is closed or sold out.', 'Відповідних майбутніх слотів не отримано. Це не підтвердження закриття маршруту чи відсутності всіх місць.')}</p> : <div className={styles.slots}>{shownSlots.map(slot => {
              const percent = slot.percentages[category];
              return <article key={slot.start} className={`${styles.slot} ${percent === 0 ? styles.zeroSlot : ''}`}><div className={styles.slotTop}><strong>{slot.start} <span>– {slot.end}</span></strong><span className={percent && percent > 0 ? styles.percent : styles.unknown}>{percent === null ? t('Unknown', 'Невідомо') : `${percent}%`}</span></div><p>{percent === 0 ? t('0% published for this category', 'Опубліковано 0% для цієї категорії') : t('Seats for your group: not confirmed', 'Місця для групи: не підтверджено')}</p></article>;
            })}</div>}

            {!!currentSlots.length && <details className={styles.manual}>
              <summary>{t('Calculate a group split from seat counts you have checked', 'Розрахувати розподіл за перевіреною вами кількістю місць')}</summary>
              <p>{t('Enter remaining seats for this category only if you have checked the exact count. These values stay in this page, expire after five minutes and are cleared on refresh or category change. They do not reserve places.', 'Вводьте залишок для цієї категорії лише якщо ви перевірили точну кількість. Значення залишаються на цій сторінці, діють п’ять хвилин і скидаються після оновлення пошуку або зміни категорії. Це не резервує місця.')}</p>
              <div className={styles.seatInputs}>{currentSlots.filter(slot => slot.percentages[category] !== 0).map(slot => {
                const key = `${slot.date}/${slot.start}`;
                return <label key={key}>{slot.start}<input aria-label={`${t('Checked remaining seats at', 'Перевірений залишок о')} ${slot.start}`} type="number" min="0" max="10000" step="1" placeholder="—" value={entries[key]?.seats ?? ''} onChange={event => {
                  const raw = event.target.value, value = Number(raw);
                  setEntries(previous => { const next = { ...previous }; if (raw === '' || !Number.isInteger(value) || value < 0 || value > 10000) delete next[key]; else next[key] = { seats: value, checkedAt: Date.now() }; return next; }); setNow(Date.now());
                }} /></label>;
              })}</div>
              <div aria-live="polite" className={styles.plans}>
                <h4>{t('Plans based on your entered counts', 'Варіанти за введеними вами даними')}</h4>
                {!plans.length || sourceStale ? <p>{t('No group fit confirmed by current inputs. Add checked counts, allow splitting, or try another day.', 'За поточними даними розміщення групи не підтверджено. Додайте перевірені числа, дозвольте розподіл або оберіть інший день.')}</p> : plans.slice(0, 6).map((plan, index) => <div key={index} className={styles.plan}><strong>{plan.length === 1 ? t('Together', 'Разом') : `${plan.length} ${t('entry slots', 'слоти входу')}`}</strong><span>{plan.map(item => `${item.start} — ${item.people} ${t('people', 'людей')}`).join(' + ')}</span></div>)}
                {split && <p>{t('Each subgroup must enter at its booked time. Separate bookings are not an atomic reservation for the whole group.', 'Кожна підгрупа має входити у свій заброньований час. Окремі бронювання не гарантують одночасне резервування всієї групи.')}</p>}
              </div>
            </details>}
          </>}
        </>}
      </section>
      <section className={styles.booking}>
        <div><h2>{t('Continue on SIMplifica', 'Перейти до SIMplifica')}</h2><p>{t('Choose the route, date, time and number of people on the official portal. Your selections here are not transferred automatically. Final availability and booking are confirmed there.', 'Оберіть маршрут, дату, час і кількість людей на офіційному порталі. Вибрані тут параметри не переносяться автоматично. Остаточна доступність і бронювання підтверджуються там.')}</p></div>
        <a className={styles.primary} href={BOOKING_URL} target="_blank" rel="noopener noreferrer">{t('Open booking portal ↗', 'Відкрити бронювання ↗')}</a>
      </section>
      <p className={styles.source}>{t('Source:', 'Джерело:')} <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">SIMplifica / IFCN</a>. {t('Booking availability is not a trail safety or opening-status report.', 'Доступність бронювання не є звітом про безпеку чи відкриття маршруту.')}</p>
    </div>
  </Layout>;
}
