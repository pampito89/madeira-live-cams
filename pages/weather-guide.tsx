import { translatedStaticProps } from '../lib/i18n/pageTranslations';
import { useText } from '../lib/i18n/TranslationProvider';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useMessages } from '../lib/i18n/useMessages';
import { weatherUi } from '../lib/i18n/weatherUi';
import { localePath, type Locale } from '../lib/i18n/config';
import { MADEIRA_TIME_ZONE, clockChange, clockMessages, formatSunrise, sunriseDays, windyCloudUrl, type SunriseDay } from '../lib/sunriseTime';

type ForecastState = { loading: boolean; error: string | null; days: SunriseDay[] };
const availabilityLabels: Record<Locale, string> = {
    en: 'Trail availability', pt: 'Disponibilidade do percurso', de: 'Verfügbarkeit der Wanderroute',
    fr: 'Disponibilité du sentier', es: 'Disponibilidad de la ruta', pl: 'Dostępność szlaku', uk: 'Завантаженість маршруту',
};

export default function WeatherGuidePage() {
    const { translate: localize } = useText();
    const { siteLocale, messages } = useMessages();
    const [forecast, setForecast] = useState<ForecastState>({ loading: true, error: null, days: [] });
    const ui = weatherUi[siteLocale];
    const text = messages.weatherGuide;
    const availabilityUrl = `${localePath(siteLocale, '/trail-availability')}?route=225&days=7&autoload=1#time-slots`;

    function sunriseRating(day: SunriseDay) {
        const clear = day.midClouds === 0 && day.highClouds === 0 && day.lowClouds <= 70 && day.rainChance === 0;
        if (clear && day.windSpeed <= 5) return { ...text.ratings.excellent, className: 'border-moss bg-mist text-forest', icon: '☀️' };
        if (clear) return { ...text.ratings.good, className: 'border-leaf/30 bg-leaf/10 text-forest', icon: '🌤️' };
        if (day.rainChance > 0) return { ...text.ratings.cloudyRisk, className: 'border-clay/50 bg-clay/15 text-[#7A4028]', icon: '🌧️' };
        return { ...text.ratings.mixed, className: 'border-slate-300 bg-slate-100 text-slate-700', icon: '☁️' };
    }

    useEffect(() => {
        const controller = new AbortController();
        async function loadForecast() {
            try {
                const url = 'https://api.open-meteo.com/v1/forecast?latitude=32.7352&longitude=-16.928'
                    + '&hourly=cloud_cover_low,cloud_cover_mid,cloud_cover_high,precipitation_probability,wind_speed_10m,wind_direction_10m'
                    + '&daily=sunrise&forecast_days=9&timezone=GMT';
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) throw new Error(text.errorFallback);
                const days = sunriseDays(await response.json());
                if (days.length !== 7) throw new Error(text.errorFallback);
                setForecast({ loading: false, error: null, days });
            } catch {
                if (!controller.signal.aborted) setForecast({ loading: false, error: text.errorFallback, days: [] });
            }
        }
        loadForecast();
        return () => controller.abort();
    }, [text.errorFallback]);

    return (<Layout>
        <Head>
            <title>{localize(text.pageTitle)}</title>
            <meta name="description" content={localize(text.pageDescription)} />
            <meta property="og:title" content={localize(text.pageTitle)} />
            <meta property="og:description" content={localize(text.ogDescription)} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={localize(text.pageTitle)} />
            <meta name="twitter:description" content={localize(text.pageDescription)} />
        </Head>
        <main className="page-shell">
            <section className="relative isolate mb-6 overflow-hidden rounded-2xl bg-forest px-5 py-7 text-white shadow-lg shadow-forest/15 sm:px-8 sm:py-9">
                <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-center md:hidden" style={{ backgroundImage: "url('/images/pico-radar-mobile.png')" }} />
                <div aria-hidden="true" className="absolute inset-0 -z-20 hidden bg-cover bg-center md:block" style={{ backgroundImage: "url('/images/pico-radar-desktop.png')" }} />
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-[#092b22]/95 via-[#0b3d31]/82 to-[#11223b]/78" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">{localize(text.eyebrow)}</p>
                <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">{localize(text.title)}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 sm:text-base">{localize(text.intro)}</p>
            </section>
            <section className="rounded-2xl border border-moss/60 bg-white p-3 shadow-sm sm:p-4">
                {forecast.loading && <div className="rounded-xl border border-moss/40 bg-panel p-4 text-sm text-slate-600">{localize(text.loading)}</div>}
                {forecast.error && <div className="rounded-xl border border-lava/40 bg-lava/10 p-4 text-sm text-[#7A3021]">{localize(forecast.error)} {localize(text.errorRetry)}</div>}
                {!forecast.loading && !forecast.error && <div className="grid gap-2.5 lg:grid-cols-2">
                    {forecast.days.map(day => {
                        const rating = sunriseRating(day);
                        const change = clockChange(day.date);
                        const dateLabel = new Intl.DateTimeFormat(ui.intlLocale, { weekday: 'short', day: 'numeric', month: 'short', timeZone: MADEIRA_TIME_ZONE }).format(new Date(`${day.date}T12:00:00Z`));
                        return <article key={day.date} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-moss hover:shadow-md">
                            <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold text-navy">{localize(dateLabel)}</h2>
                                    <p className="text-xs text-slate-500">☀️ <time dateTime={day.sunrise}>{formatSunrise(day.sunrise, ui.intlLocale)}</time></p>
                                </div>
                                <div className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${rating.className}`} aria-label={localize(`${rating.title}: ${rating.description}`)} title={localize(`${rating.title}: ${rating.description}`)}>
                                    <span aria-hidden="true">{rating.icon}</span><span>{localize(rating.title)}</span>
                                </div>
                            </div>
                            {change && <p role="note" className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs leading-4 text-amber-900"><span aria-hidden="true">↻ </span>{clockMessages[siteLocale][change]}</p>}
                            <div className="mt-2 grid grid-cols-3 overflow-hidden rounded-lg border border-moss/30 bg-panel text-center">
                                {([
                                    ['☁️⬇️', text.lowClouds, day.lowClouds],
                                    ['☁️', text.midClouds, day.midClouds],
                                    ['☁️⬆️', text.highClouds, day.highClouds],
                                ] as const).map(([icon, title, value], index) => <div key={title} className={`${index < 2 ? 'border-r border-moss/30 ' : ''}px-1.5 py-1.5`} title={localize(title)}>
                                    <p className="text-sm leading-4" aria-hidden="true">{icon}</p><p className="mt-0.5 text-sm font-semibold leading-4 text-navy">{localize(value)}%</p>
                                </div>)}
                            </div>
                            <div className="mt-1.5 grid grid-cols-2 overflow-hidden rounded-lg border border-moss/30 bg-panel">
                                <div className="flex items-center justify-center gap-1 border-r border-moss/30 px-2 py-1.5" title={localize(text.rainChance)}><span aria-hidden="true">🌧️</span><span className="text-sm font-semibold leading-4 text-navy">{localize(day.rainChance)}%</span></div>
                                <div className="flex items-center justify-center gap-1 px-2 py-1.5" title={localize(text.windAtSunrise)}><span aria-hidden="true">💨</span><span className="text-sm font-semibold leading-4 text-navy">{localize(day.windSpeed)} {localize(ui.windUnit)}</span><span className="inline-flex h-4 w-4 items-center justify-center text-base font-bold leading-none text-ocean" style={{ transform: `rotate(${day.windDirection}deg)` }} aria-label={`${day.windDirection}°`} title={`${day.windDirection}°`}>↑</span></div>
                            </div>
                            <div className="mt-2 flex gap-1.5">
                                <a href={availabilityUrl} className="inline-flex flex-1 items-center justify-center rounded-md border border-ocean bg-white px-2 py-1.5 text-xs font-semibold text-ocean transition hover:bg-ocean hover:text-white focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2">{availabilityLabels[siteLocale]}</a>
                                <a href={windyCloudUrl(day.sunrise)} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center rounded-md bg-ocean px-2 py-1.5 text-xs font-semibold text-white transition hover:bg-forest focus:outline-none focus:ring-2 focus:ring-leaf focus:ring-offset-2">{localize(text.openWindy)}</a>
                            </div>
                        </article>;
                    })}
                </div>}
                <section className="mt-4 rounded-lg border border-moss/30 bg-mist px-3 py-3 text-xs leading-5 text-slate-600">
                    <h2 className="text-sm font-semibold text-navy">{localize(ui.legend.title)}</h2>
                    <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                        {([['☀️', ui.legend.sunrise], ['☁️⬇️', ui.legend.lowClouds], ['☁️', ui.legend.midClouds], ['☁️⬆️', ui.legend.highClouds], ['🌧️', ui.legend.rain], ['💨', ui.legend.wind]] as const).map(([icon, label]) => <p key={label}><span aria-hidden="true">{icon}</span> — {localize(label)}</p>)}
                    </div>
                    <p className="mt-2 text-slate-500"><span className="mr-1 inline-flex h-4 w-4 items-center justify-center text-base font-bold leading-none text-ocean" aria-hidden="true">↑</span>{localize(ui.legend.arrow)}</p>
                </section>
            </section>
        </main>
    </Layout>);
}
export const getStaticProps = translatedStaticProps('/weather-guide');
