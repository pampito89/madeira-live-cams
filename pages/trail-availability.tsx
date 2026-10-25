import { withServerTranslations } from '../lib/i18n/pageTranslations';
import { useText } from '../lib/i18n/TranslationProvider';
import { TrailWeatherProvider, TrailSlotWeather } from '../components/TrailSlotWeather';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
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
    initialRoute: string;
    initialPeriod: number;
    autoLoad: boolean;
};
type Search = { route: number; dates: string[] };

export const getServerSideProps: GetServerSideProps<Props> = withServerTranslations<Props>(async ({ query }) => {
    const { getTrails } = await import('../lib/simplifica');
    const initialDate = madeiraDate();
    try {
        const trails = await getTrails();
        const requestedRoute = typeof query.route === 'string' ? trails.find(item => String(item.id) === query.route) : undefined;
        const requestedPeriod = typeof query.days === 'string' && ['7', '14', '30', '60'].includes(query.days) ? Number(query.days) : 30;
        return { props: {
            trails, initialDate, catalogUnavailable: false,
            initialRoute: String(requestedRoute?.id ?? trails.find(item => item.id === 301)?.id ?? trails[0]?.id ?? ''),
            initialPeriod: requestedPeriod,
            autoLoad: Boolean(requestedRoute && query.autoload === '1'),
        } };
    } catch {
        return { props: { trails: [], initialDate, catalogUnavailable: true, initialRoute: '', initialPeriod: 30, autoLoad: false } };
    }
}, '/trail-availability');

export default function TrailAvailabilityPage({ trails, initialDate, catalogUnavailable, initialRoute, initialPeriod, autoLoad }: Props) {
    const { translate: localize, language: translationLanguage } = useText();
    const { locale } = useMessages();
    const uk = locale === 'uk';
    const t = (en: string, ua: string) => localize(uk ? ua : en);
    const [route, setRoute] = useState(initialRoute);
    const [period, setPeriod] = useState(initialPeriod);
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

    const loadSlots = useCallback(async (requestedRoute: string, requestedPeriod: number) => {
        if (!requestedRoute) return;
        controller.current?.abort();
        const abort = new AbortController();
        controller.current = abort;
        const id = ++version.current;
        // Refresh Madeira's date even when the page has stayed open overnight.
        const start = madeiraDate();
        const requested = planningDates(start, addDays(start, requestedPeriod - 1));
        setSearch({ route: Number(requestedRoute), dates: requested });
        setDays({});
        setSelected(start);
        setLoading(true);
        try {
            for (const first of weekStarts(requested)) {
                let batch: TrailDay[];
                try {
                    const response = await fetch(`/api/trail-availability?route=${encodeURIComponent(requestedRoute)}&start=${first}`, { signal: abort.signal });
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
        } finally {
            if (version.current === id && !abort.signal.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        setRoute(initialRoute);
        setPeriod(initialPeriod);
        if (autoLoad && initialRoute) void loadSlots(initialRoute, initialPeriod);
        return () => { controller.current?.abort(); };
    }, [autoLoad, initialRoute, initialPeriod, loadSlots]);

    function load(event: FormEvent) {
        event.preventDefault();
        void loadSlots(route, period);
    }

    const dateLabel = (date: string) => new Intl.DateTimeFormat(translationLanguage, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Atlantic/Madeira' }).format(new Date(`${date}T12:00:00Z`));
    const stale = (day: TrailDay) => !day.checkedAt || now - Date.parse(day.checkedAt) >= 300000;
    const loaded = search?.dates.filter(date => !!days[date]).length ?? 0;
    const failed = search?.dates.filter(date => days[date]?.error).length ?? 0;
    const active = days[selected];
    const slots = active ? availableSlots(active, category, now) : [];
    const searchedTrail = trails.find(item => item.id === search?.route);
    const categories: [BookingCategory, string][] = [['visitor', t('Non-resident visitor', 'Відвідувач / нерезидент')], ['operator', t('Economic operator', 'Туроператор')], ['resident', t('Madeira resident', 'Резидент Мадейри')]];
    const today = now ? madeiraDate(new Date(now)) : initialDate;
    const calendarDates = search?.dates ?? planningDates(today, addDays(today, period - 1));
    const groupOutside = groupRanges.some(range => range.from < calendarDates[0] || range.to > calendarDates[calendarDates.length - 1]);

    return <Layout><Head>
        <title>{localize(title)} | Madeira Live Cams</title><meta name="description" content={localize(description)} />
        <meta property="og:title" content={localize(title)} /><meta property="og:description" content={localize(description)} /><meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" /><meta name="twitter:title" content={localize(title)} /><meta name="twitter:description" content={localize(description)} />
    </Head><div className={`page-shell ${styles.page}`}>
        <section className={styles.hero}><div className={styles.eyebrow}>{t('MADEIRA · GROUP PLANNING', 'МАДЕЙРА · ПЛАНУВАННЯ ДЛЯ ГРУП')}</div><h1>{localize(title)}</h1><p>{t('Your group. Your dates. Find the right time slot.', 'Ваша група. Ваші дати. Знайдіть зручний тайм-слот.')}</p></section>
        <form className={styles.filters} onSubmit={load}>
            <div className={styles.fields} style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
                <label>{t('Walking route', 'Маршрут')}<select value={route} onChange={event => { reset(); setRoute(event.target.value); }} disabled={!trails.length}>
                    {!trails.length && <option value="">{t('Routes unavailable', 'Маршрути недоступні')}</option>}
                    {trails.map(item => <option key={item.id} value={item.id}>{localize(item.name)}</option>)}
                </select></label>
                <label>{t('Booking category', 'Категорія бронювання')}<select value={category} onChange={event => setCategory(event.target.value as BookingCategory)}>{categories.map(([id, label]) => <option key={id} value={id}>{localize(label)}</option>)}</select></label>
            </div>
            <div className={styles.shortcuts}><span>{t('From today:', 'Від сьогодні:')}</span>{[7, 14, 30, 60].map(count => <button key={count} type="button" aria-pressed={period === count} onClick={() => { reset(); setPeriod(count); }}>{localize(count)} {t('days', 'днів')}</button>)}</div>
            <GroupTourCalendar today={today} uk={uk} onChange={setGroupRanges} />
            {groupOutside && <p className={styles.source}>{t('Some group dates fall outside the displayed period. Choose a longer period to see them.', 'Частина дат групи поза показаним періодом. Оберіть довший період, щоб побачити їх.')}</p>}
            <div className={styles.filterBottom}><span className={styles.source}>{dateLabel(today)} – {dateLabel(addDays(today, period - 1))}</span><button className={styles.primary} disabled={!route || loading}>{loading ? t('Checking…', 'Перевіряємо…') : t('Show time slots →', 'Показати тайм-слоти →')}</button></div>
        </form>
        <section id="time-slots" className={styles.results} style={{ scrollMarginTop: '6rem' }}>
            <div className={`${styles.resultHeading} ${lab.resultHeading}`}><h2>{localize(searchedTrail?.name || t('Available time slots', 'Доступні тайм-слоти'))}</h2><a className={lab.bookingButton} href={`${BOOKING_URL}/start`} target="_blank" rel="noopener noreferrer" aria-label={t('Book on SIMplifica (opens in a new tab)', 'Бронювати в SIMplifica (у новій вкладці)')}>{t('Book', 'Бронювати')}</a></div>
            <div role="status" aria-live="polite">
                {search && <p className={styles.progress}>{t('Days checked:', 'Перевірено днів:')} {localize(loaded)}/{localize(search.dates.length)}{loading ? '…' : ''}{failed > 0 && ` · ${t('Unavailable:', 'Без даних:')} ${failed}`}</p>}
                {catalogUnavailable && <p className={styles.error}>{t('SIMplifica route list is unavailable. Reload or open the official portal.', 'Перелік маршрутів SIMplifica недоступний. Оновіть сторінку або відкрийте офіційний портал.')}</p>}
            </div>
            {!search && <p className={styles.empty}>{t('Choose a route and period, then show time slots.', 'Оберіть маршрут і період та натисніть «Показати тайм-слоти».')}</p>}
            {search && <>
                <div className={styles.days} aria-label={t('Select day', 'Оберіть день')}>{search.dates.map(date => {
                    const day = days[date];
                    const count = day && !day.error ? availableSlots(day, category, now).length : null;
                    const unknown = day && !day.error && (!day.slots.length || day.slots.some(slot => slot.percentages[category] === null));
                    const label = !day ? t('Waiting', 'Очікуємо') : day.error ? t('No data', 'Без даних') : stale(day) ? t('Refresh needed', 'Час оновити') : unknown && !count ? t('Unknown', 'Невідомо') : timeSlotLabel(count ?? 0, uk);
                    const group = isGroupDay(date);
                    return <button type="button" key={date} aria-pressed={date === selected} className={`${styles.day} ${date === selected ? styles.selectedDay : ''} ${group ? lab.groupDay : ''}`} onClick={() => setSelected(date)}><span>{dateLabel(date)}</span><strong>{localize(count === null || (unknown && !count) ? '—' : count)}</strong><small>{localize(label)}</small>{group && <small className={lab.badge}>{t('Group tour', 'Груповий тур')}</small>}</button>;
                })}</div>
                <div className={styles.dayHeading}><h3>{dateLabel(selected)}{isGroupDay(selected) && <span className={lab.headingBadge}>{t('Group tour', 'Груповий тур')}</span>}</h3><p>{localize(active?.checkedAt ? `${t('Checked', 'Перевірено')} ${new Intl.DateTimeFormat(translationLanguage, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Atlantic/Madeira' }).format(new Date(active.checkedAt))}` : t('No verified data yet', 'Перевірених даних ще немає'))}</p></div>
                {!active ? <p className={styles.empty}>{t('This date is waiting to be checked.', 'Ця дата очікує перевірки.')}</p> : active.error ? <p className={styles.error}>{t('Could not check this date. Run the search again.', 'Не вдалося перевірити цю дату. Запустіть пошук ще раз.')}</p> : <>
                    {stale(active) && <p className={styles.error}>{t('Data is more than five minutes old. Refresh the search.', 'Даним понад п’ять хвилин. Оновіть пошук.')}</p>}
                    {!slots.length && <p className={styles.empty}>{active.slots.length && active.slots.every(slot => slot.percentages[category] !== null) ? t('No available future time slots for this category on this day. Choose another date.', 'На цей день немає доступних майбутніх тайм-слотів для цієї категорії. Оберіть іншу дату.') : t('Availability could not be confirmed for this date. Try again or check SIMplifica.', 'Доступність на цю дату не підтверджена. Повторіть пошук або перевірте SIMplifica.')}</p>}
                    <TrailWeatherProvider route={search.route} date={selected} uk={uk}><div className={styles.slots} aria-label={t('Available time slots', 'Доступні тайм-слоти')}>{slots.map(slot => <article key={slot.start} className={styles.slot}><div className={`${styles.slotTop} ${lab.slotTop}`}><strong>{localize(slot.start)} <span>– {localize(slot.end)}</span></strong><TrailSlotWeather time={slot.start} /><span className={styles.percent}>{t('Tickets:', 'Квитків:')} {new Intl.NumberFormat(translationLanguage, { maximumFractionDigits: 2 }).format(slot.percentages[category]!)}%</span></div></article>)}</div></TrailWeatherProvider>
                </>}
            </>}
        </section>
        <p className={styles.source}>{t('Source:', 'Джерело:')} <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">SIMplifica / IFCN</a> · {t('Madeira local time', 'Місцевий час Мадейри')}</p>
    </div></Layout>;
}
