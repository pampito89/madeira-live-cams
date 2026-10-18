import { useText } from '../lib/i18n/TranslationProvider';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { slotWeather, TrailForecast, weatherIcon } from '../lib/trailWeather';
import styles from '../styles/trailWeather.module.css';
const cache = new Map<number, TrailForecast>();
const WeatherContext = createContext<{
    forecast?: TrailForecast;
    date: string;
    uk: boolean;
    status: string;
}>({ date: '', uk: false, status: 'loading' });
export function TrailWeatherProvider({ route, date, uk, children }: {
    route: number;
    date: string;
    uk: boolean;
    children: ReactNode;
}) {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
    const [state, setState] = useState<{
        route: number;
        forecast?: TrailForecast;
        status: string;
    }>({ route, status: 'loading' });
    useEffect(() => {
        const saved = cache.get(route);
        if (saved && Date.now() - Date.parse(saved.fetchedAt) < 900000) {
            setState({ route, forecast: saved, status: 'ready' });
            return;
        }
        const abort = new AbortController();
        setState({ route, status: 'loading' });
        fetch(`/api/trail-weather?route=${route}`, { signal: abort.signal }).then(async (response) => {
            if (!response.ok)
                throw new Error(response.status === 404 ? 'start' : 'error');
            const forecast: TrailForecast = await response.json();
            if (!abort.signal.aborted) {
                cache.set(route, forecast);
                setState({ route, forecast, status: 'ready' });
            }
        }).catch(error => {
            if (!abort.signal.aborted)
                setState({ route, status: error.message === 'start' ? 'start' : 'error' });
        });
        return () => abort.abort();
    }, [route]);
    const current = state.route === route ? state : { status: 'loading', forecast: undefined };
    return <WeatherContext.Provider value={{ ...current, date, uk }}>{localize(children)}<p className={styles.legend}>{localize(uk ? 'Погода на старті маршруту · % — хмарність · мм — опади за годину. Натисніть значок для деталей.' : 'Weather at the trail start · % cloud cover · mm precipitation per hour. Tap an icon for details.')} <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">{localize("Open-Meteo")}</a></p></WeatherContext.Provider>;
}
export function TrailSlotWeather({ time }: {
    time: string;
}) {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
    const { forecast, date, uk, status } = useContext(WeatherContext);
    const hour = slotWeather(forecast, date, time);
    const t = (en: string, ua: string) => localize(uk ? ua : en);
    const number = new Intl.NumberFormat(translationLanguage, { maximumFractionDigits: 2 });
    const value = hour ? hour.rain > 0 ? `${number.format(hour.rain)} ${t('mm', 'мм')}` : `${Math.round(hour.cloud)}%` : status === 'loading' ? '…' : '—';
    const label = hour ? `${t('Weather', 'Погода')}: ${hour.rain > 0 ? t('precipitation', 'опади') : t('cloud cover', 'хмарність')} ${value}` : t('Weather unavailable', 'Погода недоступна');
    const start = `${time.slice(0, 2)}:00`;
    const end = `${String((Number(time.slice(0, 2)) + 1) % 24).padStart(2, '0')}:00`;
    return <details className={styles.weather}><summary aria-label={localize(label)}><span aria-hidden="true">{localize(hour ? weatherIcon(hour) : '')}</span> {localize(value)}</summary><div className={styles.detail}>
    {localize(hour && forecast ? <><strong>{localize(forecast.point.name)}</strong><span>{localize(date)}{localize(" \u00B7 ")}{localize(start)}{localize(" (")}{localize(t('Madeira time', 'час Мадейри'))}{localize(")")}</span><span>{localize(t('Cloud cover', 'Хмарність'))}{localize(": ")}{localize(Math.round(hour.cloud))}{localize("%")}</span><span>{localize(t('Precipitation', 'Опади'))} {localize(start)}{localize("\u2013")}{localize(end)}{localize(": ")}{localize(number.format(hour.rain))} {localize(t('mm', 'мм'))}</span><span>{localize(t('Hourly forecast; half-hour slots use the start of the hour.', 'Погодинний прогноз: для півгодинних слотів — дані на початок години.'))}</span><span>{localize(t('Retrieved', 'Отримано'))}{localize(": ")}{localize(new Intl.DateTimeFormat(translationLanguage, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Atlantic/Madeira' }).format(new Date(forecast.fetchedAt)))}</span><a href={forecast.point.source} target="_blank" rel="noopener noreferrer">{localize(t('Trail start · Visit Madeira', 'Старт маршруту · Visit Madeira'))}</a></> : <span>{localize(status === 'loading' ? t('Loading forecast…', 'Завантажуємо прогноз…') : status === 'start' ? t('Trail start coordinates are not yet verified.', 'Координати старту цього маршруту ще не підтверджені.') : status === 'error' ? t('Weather is temporarily unavailable.', 'Погода тимчасово недоступна.') : t('No forecast for this date. Forecasts extend up to 16 days.', 'Для цієї дати прогнозу немає. Прогноз доступний до 16 днів наперед.'))}</span>)}
  </div></details>;
}
