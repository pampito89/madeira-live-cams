import { withStaticTranslations, withServerTranslations, translatedStaticProps } from '../lib/i18n/pageTranslations';
import { useText } from '../lib/i18n/TranslationProvider';
import { TrailWeatherProvider, TrailSlotWeather } from "../components/TrailSlotWeather";
import { FormEvent, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import Layout from '../components/Layout';
import GroupTourCalendar, { TourRange } from '../components/GroupTourCalendar';
import { useMessages } from '../lib/i18n/useMessages';
import { addDays, AvailabilityResult, BOOKING_URL, BookingCategory, madeiraDate, Trail, TrailDay } from '../lib/trailAvailability';
import { planningDates, weekStarts } from '../lib/trailPlanning';
import { availableSlots, timeSlotLabel } from '../lib/trailBooking';
import styles from '../styles/trailAvailability.module.css';
import lab from '../styles/trailLabTravel.module.css';
type Props = {
    trails: Trail[];
    initialDate: string;
    catalogUnavailable: boolean;
};
type Search = {
    route: number;
    dates: string[];
};
export const getServerSideProps: GetServerSideProps<Props> = withServerTranslations<Props>(async () => {
    const { getTrails } = await import('../lib/simplifica');
    try {
        return { props: { trails: await getTrails(), initialDate: madeiraDate(), catalogUnavailable: false } };
    }
    catch {
        return { props: { trails: [], initialDate: madeiraDate(), catalogUnavailable: true } };
    }
}, "/trail-availability");
export default function TrailAvailabilityPage({ trails, initialDate, catalogUnavailable }: Props) {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
    const { locale } = useMessages();
    const uk = locale === 'uk';
    const t = (en: string, ua: string) => localize(uk ? ua : en);
    const [route, setRoute] = useState(String(trails.find(item => item.id === 301)?.id ?? trails[0]?.id ?? ''));
    const [period, setPeriod] = useState(30);
    const [category, setCategory] = useState<BookingCategory>('visitor');
    const [groupRanges, setGroupRanges] = useState<TourRange[]>([]);
    const isGroupDay = (date: string) => groupRanges.some(range => date >= range.from && date <= range.to);
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
        setLoading(false);
        setSearch(null);
        setDays({});
        setSelected('');
    }
    async function load(event: FormEvent) {
        event.preventDefault();
        if (!route)
            return;
        controller.current?.abort();
        const abort = new AbortController();
        controller.current = abort;
        const id = ++version.current;
        // Refresh the Madeira date at search time, including after an overnight tab stays open.
        const start = madeiraDate();
        const requested = planningDates(start, addDays(start, period - 1));
        setSearch({ route: Number(route), dates: requested });
        setDays({});
        setSelected(start);
        setLoading(true);
        try {
            for (const first of weekStarts(requested)) {
                let batch: TrailDay[];
                try {
                    const response = await fetch(`/api/trail-availability?route=${encodeURIComponent(route)}&start=${first}`, { signal: abort.signal });
                    const payload: AvailabilityResult = await response.json();
                    if (!response.ok || !Array.isArray(payload.days))
                        throw new Error('Unavailable');
                    batch = payload.days;
                }
                catch {
                    if (abort.signal.aborted)
                        return;
                    batch = requested.filter(date => date >= first && date <= addDays(first, 6)).map(date => ({ date, slots: [], checkedAt: null, error: true }));
                }
                if (version.current !== id || abort.signal.aborted)
                    return;
                setDays(previous => {
                    const next = { ...previous };
                    for (const day of batch)
                        if (requested.includes(day.date))
                            next[day.date] = day;
                    return next;
                });
                setNow(Date.now());
            }
        }
        finally {
            if (version.current === id)
                setLoading(false);
        }
    }
    const dateLabel = (date: string) => new Intl.DateTimeFormat(translationLanguage, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Atlantic/Madeira' }).format(new Date(localizeFormat("__VAR_0__T12:00:00Z", date)));
    const stale = (day: TrailDay) => !day.checkedAt || now - Date.parse(day.checkedAt) >= 300000;
    const loaded = search?.dates.filter(date => !!days[date]).length ?? 0;
    const failed = search?.dates.filter(date => days[date]?.error).length ?? 0;
    const active = days[selected];
    const slots = active ? availableSlots(active, category, now) : [];
    const searchedTrail = trails.find(item => item.id === search?.route);
    const categories: [
        BookingCategory,
        string
    ][] = [['visitor', t('Non-resident visitor', 'Відвідувач / нерезидент')], ['operator', t('Economic operator', 'Туроператор')], ['resident', t('Madeira resident', 'Резидент Мадейри')]];
    const today = now ? madeiraDate(new Date(now)) : initialDate;
    const calendarDates = search?.dates ?? planningDates(today, addDays(today, period - 1));
    const groupOutside = groupRanges.some(range => range.from < calendarDates[0] || range.to > calendarDates[calendarDates.length - 1]);
    return <Layout><Head>
    <title>{[localize(title), localize(" | Madeira Live Cams")].join("")}</title><meta name="description" content={localize(description)}/>
    <meta property="og:title" content={localize(title)}/><meta property="og:description" content={localize(description)}/><meta property="og:type" content="website"/>
    <meta name="twitter:card" content="summary"/><meta name="twitter:title" content={localize(title)}/><meta name="twitter:description" content={localize(description)}/>
  </Head><div className={`page-shell ${styles.page}`}>
    <section className={styles.hero}><div className={styles.eyebrow}>{localize(t('MADEIRA · GROUP PLANNING', 'МАДЕЙРА · ПЛАНУВАННЯ ДЛЯ ГРУП'))}</div><h1>{localize(title)}</h1><p>{localize(t('Your group. Your dates. Find the right time slot.', 'Ваша група. Ваші дати. Знайдіть зручний тайм-слот.'))}</p></section>
    <form className={styles.filters} onSubmit={load}>
      <div className={styles.fields} style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <label>{localize(t('Walking route', 'Маршрут'))}<select value={route} onChange={event => { reset(); setRoute(event.target.value); }} disabled={!trails.length}>{localize(!trails.length && <option value="">{localize(t('Routes unavailable', 'Маршрути недоступні'))}</option>)}{localize(trails.map(item => <option key={item.id} value={item.id}>{localize(item.name)}</option>))}</select></label>
        <label>{localize(t('Booking category', 'Категорія бронювання'))}<select value={category} onChange={event => setCategory(event.target.value as BookingCategory)}>{localize(categories.map(([id, label]) => <option key={id} value={id}>{localize(label)}</option>))}</select></label>
      </div>
      <div className={styles.shortcuts}><span>{localize(t('From today:', 'Від сьогодні:'))}</span>{localize([7, 14, 30, 60].map(count => <button key={count} type="button" aria-pressed={period === count} onClick={() => { reset(); setPeriod(count); }}>{localize(count)} {localize(t('days', 'днів'))}</button>))}</div>
      <GroupTourCalendar today={today} uk={uk} onChange={setGroupRanges}/>
      {localize(groupOutside && <p className={styles.source}>{localize(t('Some group dates fall outside the displayed period. Choose a longer period to see them.', 'Частина дат групи поза показаним періодом. Оберіть довший період, щоб побачити їх.'))}</p>)}
      <div className={styles.filterBottom}><span className={styles.source}>{localize(dateLabel(today))}{localize(" \u2013 ")}{localize(dateLabel(addDays(today, period - 1)))}</span><button className={styles.primary} disabled={!route || loading}>{localize(loading ? t('Checking…', 'Перевіряємо…') : t('Show time slots →', 'Показати тайм-слоти →'))}</button></div>
    </form>
    <section className={styles.results}>
      <div className={`${styles.resultHeading} ${lab.resultHeading}`}><h2>{localize(searchedTrail?.name || t('Available time slots', 'Доступні тайм-слоти'))}</h2><a className={lab.bookingButton} href={`${BOOKING_URL}/start`} target="_blank" rel="noopener noreferrer" aria-label={localize(t('Book on SIMplifica (opens in a new tab)', 'Бронювати в SIMplifica (у новій вкладці)'))}>{localize(t('Book', 'Бронювати'))}</a></div>
      <div role="status" aria-live="polite">{localize(search && <p className={styles.progress}>{localize(t('Days checked:', 'Перевірено днів:'))} {localize(loaded)}{localize("/")}{localize(search.dates.length)}{localize(loading ? '…' : '')}{localize(failed > 0 && ` · ${t('Unavailable:', 'Без даних:')} ${failed}`)}</p>)}{localize(catalogUnavailable && <p className={styles.error}>{localize(t('SIMplifica route list is unavailable. Reload or open the official portal.', 'Перелік маршрутів SIMplifica недоступний. Оновіть сторінку або відкрийте офіційний портал.'))}</p>)}</div>
      {localize(!search && <p className={styles.empty}>{localize(t('Choose a route and period, then show time slots.', 'Оберіть маршрут і період та натисніть «Показати тайм-слоти».'))}</p>)}
      {localize(search && <>
        <div className={styles.days} aria-label={localize(t('Select day', 'Оберіть день'))}>{localize(search.dates.map(date => {
                const day = days[date];
                const count = day && !day.error ? availableSlots(day, category, now).length : null;
                const unknown = day && !day.error && (!day.slots.length || day.slots.some(slot => slot.percentages[category] === null));
                const label = !day ? t('Waiting', 'Очікуємо') : day.error ? t('No data', 'Без даних') : stale(day) ? t('Refresh needed', 'Час оновити') : unknown && !count ? t('Unknown', 'Невідомо') : timeSlotLabel(count ?? 0, uk);
                const group = isGroupDay(date);
                return <button type="button" key={date} aria-pressed={date === selected} className={`${styles.day} ${date === selected ? styles.selectedDay : ''} ${group ? lab.groupDay : ''}`} onClick={() => setSelected(date)}><span>{localize(dateLabel(date))}</span><strong>{localize(count === null || (unknown && !count) ? '—' : count)}</strong><small>{localize(label)}</small>{localize(group && <small className={lab.badge}>{localize(t('Group tour', 'Груповий тур'))}</small>)}</button>;
            }))}</div>
        <div className={styles.dayHeading}><h3>{localize(dateLabel(selected))}{localize(isGroupDay(selected) && <span className={lab.headingBadge}>{localize(t('Group tour', 'Груповий тур'))}</span>)}</h3><p>{localize(active?.checkedAt ? `${t('Checked', 'Перевірено')} ${new Intl.DateTimeFormat(translationLanguage, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Atlantic/Madeira' }).format(new Date(active.checkedAt))}` : t('No verified data yet', 'Перевірених даних ще немає'))}</p></div>
        {localize(!active ? <p className={styles.empty}>{localize(t('This date is waiting to be checked.', 'Ця дата очікує перевірки.'))}</p> : active.error ? <p className={styles.error}>{localize(t('Could not check this date. Run the search again.', 'Не вдалося перевірити цю дату. Запустіть пошук ще раз.'))}</p> : <>
          {localize(stale(active) && <p className={styles.error}>{localize(t('Data is more than five minutes old. Refresh the search.', 'Даним понад п’ять хвилин. Оновіть пошук.'))}</p>)}
          {localize(!slots.length && <p className={styles.empty}>{localize(active.slots.length && active.slots.every(slot => slot.percentages[category] !== null) ? t('No available future time slots for this category on this day. Choose another date.', 'На цей день немає доступних майбутніх тайм-слотів для цієї категорії. Оберіть іншу дату.') : t('Availability could not be confirmed for this date. Try again or check SIMplifica.', 'Доступність на цю дату не підтверджена. Повторіть пошук або перевірте SIMplifica.'))}</p>)}
          <TrailWeatherProvider route={search.route} date={selected} uk={uk}><div className={styles.slots} aria-label={localize(t('Available time slots', 'Доступні тайм-слоти'))}>{localize(slots.map(slot => <article key={slot.start} className={styles.slot}><div className={`${styles.slotTop} ${lab.slotTop}`}><strong>{localize(slot.start)} <span>{localize("\u2013 ")}{localize(slot.end)}</span></strong><TrailSlotWeather time={slot.start}/><span className={styles.percent}>{localize(t("Tickets:", "\u041A\u0432\u0438\u0442\u043A\u0456\u0432:"))} {localize(new Intl.NumberFormat(translationLanguage, { maximumFractionDigits: 2 }).format(slot.percentages[category]!))}{localize("%")}</span></div></article>))}</div></TrailWeatherProvider>
        </>)}
      </>)}
    </section>
    <p className={styles.source}>{localize(t('Source:', 'Джерело:'))} <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">{localize("SIMplifica / IFCN")}</a>{localize(" \u00B7 ")}{localize(t('Madeira local time', 'Місцевий час Мадейри'))}</p>
  </div></Layout>;
}
