import LocationStatusBadge from '../components/LocationStatusBadge';
import LocationQuickSearch, { locationSearchCopy, normalizeLocationSearch } from '../components/LocationQuickSearch';
import { useLocationStatuses } from '../lib/useLocationStatuses';
import { useNavigationState, rememberNavigationPosition } from '../lib/useNavigationMemory';
import { cableCarLabels } from '../lib/scenicLabels';
import { translatedStaticProps } from '../lib/i18n/pageTranslations';
import { useText } from '../lib/i18n/TranslationProvider';
import heroStyles from '../styles/locationsHero.module.css';
import ActivityPhoto from '../components/ActivityPhoto';
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getLocalizedLocation, locations, plannerLocationPath } from '../data/plannerLocations';
import { locationCoordinates } from '../lib/locationWeather';
import { useMessages } from '../lib/i18n/useMessages';

type CurrentWeather = { temperature: number; weatherCode: number; windSpeed: number; windDirection: number; time: string };
type WeatherByLocation = Record<string, CurrentWeather>;
const visibleLocations = locations.filter(location => !location.hiddenFromExplore);

function getWeatherDetails(code: number, locale: 'en' | 'uk') {
    const weather = {
        clear: { icon: '☀️', en: 'Clear', uk: 'Сонячно' },
        partlyCloudy: { icon: '🌤️', en: 'Partly cloudy', uk: 'Мінлива хмарність' },
        cloudy: { icon: '☁️', en: 'Cloudy', uk: 'Хмарно' },
        fog: { icon: '🌫️', en: 'Fog', uk: 'Туман' },
        drizzle: { icon: '🌦️', en: 'Light rain', uk: 'Невеликий дощ' },
        rain: { icon: '🌧️', en: 'Rain', uk: 'Дощ' },
        snow: { icon: '❄️', en: 'Snow', uk: 'Сніг' },
        storm: { icon: '⛈️', en: 'Thunderstorm', uk: 'Гроза' },
    };
    let condition = weather.cloudy;
    if (code === 0) condition = weather.clear;
    else if (code === 1 || code === 2) condition = weather.partlyCloudy;
    else if (code === 45 || code === 48) condition = weather.fog;
    else if ([51, 53, 55, 56, 57].includes(code)) condition = weather.drizzle;
    else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) condition = weather.rain;
    else if ([71, 73, 75, 77, 85, 86].includes(code)) condition = weather.snow;
    else if ([95, 96, 99].includes(code)) condition = weather.storm;
    return { icon: condition.icon, label: condition[locale] };
}
function getWindDirection(degrees: number, locale: 'en' | 'uk') {
    const directions = locale === 'uk'
        ? ['Північний', 'Північно-східний', 'Східний', 'Південно-східний', 'Південний', 'Південно-західний', 'Західний', 'Північно-західний']
        : ['North', 'North-east', 'East', 'South-east', 'South', 'South-west', 'West', 'North-west'];
    return directions[Math.round(degrees / 45) % 8];
}
function getWindArrow(degrees: number) {
    return ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'][Math.round(degrees / 45) % 8];
}
function formatUpdatedTime(time: string, locale: string) {
    const date = new Date(time);
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'Atlantic/Madeira' }).format(date);
}

export default function CamerasPage() {
    const locationStatuses = useLocationStatuses();
    const { translate: localize, language: translationLanguage } = useText();
    const { locale, messages } = useMessages();
    const [activeFilter, setActiveFilter] = useNavigationState('cameras:activeFilter', 'All');
    const [query, setQuery] = useNavigationState('cameras:search', '');
    const [weatherByLocation, setWeatherByLocation] = useState<WeatherByLocation>({});
    const normalizedQuery = normalizeLocationSearch(query);

    useEffect(() => {
        let cancelled = false;
        async function loadWeather() {
            const weatherLocations = visibleLocations.filter(location => locationCoordinates[location.slug]);
            const weatherEntries = await Promise.all(weatherLocations.map(async location => {
                const coordinates = locationCoordinates[location.slug];
                const params = new URLSearchParams({
                    latitude: coordinates.latitude.toString(), longitude: coordinates.longitude.toString(),
                    current: 'temperature_2m,weather_code,wind_speed_10m,wind_direction_10m',
                    wind_speed_unit: 'kmh', timezone: 'Europe/Lisbon',
                });
                try {
                    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
                    if (!response.ok) return null;
                    const data = await response.json();
                    const current = data.current;
                    if (!current) return null;
                    return [location.slug, {
                        temperature: Math.round(current.temperature_2m), weatherCode: current.weather_code,
                        windSpeed: Math.round(current.wind_speed_10m), windDirection: current.wind_direction_10m, time: current.time,
                    }] as const;
                } catch { return null; }
            }));
            if (cancelled) return;
            const nextWeather: WeatherByLocation = {};
            weatherEntries.forEach(entry => { if (entry) nextWeather[entry[0]] = entry[1]; });
            setWeatherByLocation(nextWeather);
        }
        loadWeather();
        return () => { cancelled = true; };
    }, []);

    const filters = [
        { value: 'All', label: messages.exploreList.filters.all },
        { value: 'Viewpoints', label: messages.exploreList.filters.viewpoints },
        { value: 'Hiking', label: messages.exploreList.filters.hiking },
        { value: 'Beaches', label: messages.exploreList.filters.beaches },
        { value: 'City & culture', label: messages.exploreList.filters.cityCulture },
        { value: 'Levada walks', label: messages.exploreList.filters.levadaWalks },
        { value: 'Airport', label: locale === 'uk' ? 'Аеропорт' : 'Airport' },
        { value: 'Lab Travel', label: 'Lab Travel' },
        { value: 'Outdoor activities', label: locale === 'uk' ? 'Активний відпочинок' : 'Outdoor activities' },
        { value: 'Cable cars', label: cableCarLabels[translationLanguage] },
    ];
    const searchIndex = useMemo(() => locations.map(location => {
        const display = getLocalizedLocation(location, locale);
        return { location, name: normalizeLocationSearch(localize(display.name)), text: normalizeLocationSearch([
            localize(display.name), localize(display.area), localize(display.category), location.slug,
            ...Object.values(location.name), ...Object.values(location.area), ...Object.values(location.category), ...location.tags,
        ].join(' ')) };
    }), [locale, localize]);
    const filteredLocations = useMemo(() => {
        if (!normalizedQuery) return visibleLocations.filter(location => activeFilter === 'All' || location.tags.includes(activeFilter));
        const words = normalizedQuery.split(' ');
        const rank = (name: string) => name === normalizedQuery ? 0 : name.startsWith(normalizedQuery) ? 1 : 2;
        return searchIndex.filter(entry => words.every(word => entry.text.includes(word)))
            .sort((a, b) => rank(a.name) - rank(b.name))
            .map(entry => entry.location);
    }, [activeFilter, normalizedQuery, searchIndex]);

    return <Layout>
      <Head>
        <title>{localize(messages.exploreList.pageTitle)}</title>
        <meta name="description" content={localize(messages.exploreList.pageDescription)}/>
        <meta property="og:title" content={localize(messages.exploreList.pageTitle)}/>
        <meta property="og:description" content={localize(messages.exploreList.pageDescription)}/>
        <meta property="og:type" content="website"/>
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:title" content={localize(messages.exploreList.pageTitle)}/>
        <meta name="twitter:description" content={localize(messages.exploreList.pageDescription)}/>
      </Head>
      <main className="page-shell">
        <section className={heroStyles.hero}>
          <p className="text-sm font-medium text-ocean">{localize(messages.exploreList.eyebrow)}</p>
          <h1 className="mt-1 text-2xl font-semibold text-navy sm:text-3xl">{localize(messages.exploreList.title)}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{localize(messages.exploreList.intro)}</p>
        </section>
        <section className="mt-6" aria-label={localize(messages.exploreList.filterAriaLabel)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-navy">{localize(messages.exploreList.browseByInterest)}</p>
            <LocationQuickSearch value={query} onChange={setQuery}/>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {filters.map(filter => {
                const isActive = !normalizedQuery && activeFilter === filter.value;
                return <button key={filter.value} type="button" aria-pressed={isActive} onClick={() => { setActiveFilter(filter.value); setQuery(''); }} className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium transition ${isActive ? 'border-ocean bg-ocean text-white' : 'border-slate-200 bg-white text-navy hover:border-ocean hover:text-ocean'}`}>{localize(filter.label)}</button>;
            })}
          </div>
          <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 text-sm text-slate-500">
            {localize(messages.exploreList.showing)} {filteredLocations.length} {localize(messages.exploreList.of)} {normalizedQuery ? locations.length : visibleLocations.length} {localize(messages.exploreList.places)}
          </p>
        </section>
        <section id="location-search-results" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={localize(messages.exploreList.locationsAriaLabel)}>
          {filteredLocations.length === 0 && <p className="col-span-full py-6 text-sm text-slate-500">{locationSearchCopy[translationLanguage].empty}</p>}
          {filteredLocations.map(location => {
            const displayLocation = getLocalizedLocation(location, locale);
            const weather = weatherByLocation[location.slug];
            const weatherDetails = weather ? getWeatherDetails(weather.weatherCode, locale) : null;
            const isPracticalPlace = location.tags.some(tag => ['Restaurants', 'Villas', 'Supermarkets'].includes(tag));
            return <Link key={location.slug} href={{ pathname: plannerLocationPath(location), query: { returnTo: 'cameras' } }} onClick={() => rememberNavigationPosition()} className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-leaf hover:shadow-md">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ocean">{localize(displayLocation.category)}</p>
                  <h2 className="mt-1 text-lg font-semibold text-navy">{localize(displayLocation.name)}</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">{localize(displayLocation.area)}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{localize(displayLocation.summary)}</p>
                  <span className="mt-4 inline-block text-sm font-semibold text-ocean group-hover:underline">{localize(messages.exploreList.readGuide)}</span>
                </div>
                <div className="w-20 shrink-0 sm:w-24">
                  <div className="relative h-20 overflow-hidden rounded-xl bg-mist sm:h-24">
                    {!displayLocation.image ? <span role="img" aria-label={localize(locale === 'uk' ? 'Фото незабаром' : 'Photo coming soon')} className="flex h-full items-center justify-center text-3xl">📍</span> : location.tags.includes('Outdoor activities') ? <ActivityPhoto src={displayLocation.image} name={displayLocation.imageAlt} locale={locale} compact/> : <Image src={displayLocation.image} alt={localize(displayLocation.imageAlt)} fill unoptimized className="object-cover transition duration-300 group-hover:scale-105" sizes="(max-width: 640px) 80px, 96px"/>}
                  </div>
                  {weather && weatherDetails ? <div className="mt-2 rounded-lg border border-slate-200 bg-panel px-2 py-2 text-xs text-slate-600">
                      <p className="flex items-center gap-1 font-semibold text-navy"><span aria-hidden="true">{weatherDetails.icon}</span><span>{weather.temperature}°C</span></p>
                      <p className="mt-1 leading-4">{localize(weatherDetails.label)}</p>
                      <p className="mt-1 leading-4" title={localize(`${getWindDirection(weather.windDirection, locale)}, ${weather.windSpeed} ${locale === 'uk' ? 'км/год' : 'km/h'}`)}>
                        <span className="font-semibold text-ocean" aria-hidden="true">{getWindArrow(weather.windDirection)}</span> {weather.windSpeed} {localize(locale === 'uk' ? 'км/год' : 'km/h')}
                      </p>
                      <p className="mt-1 text-[10px] leading-3 text-slate-400">{localize(locale === 'uk' ? 'Оновлено' : 'Updated')} {formatUpdatedTime(weather.time, translationLanguage)}</p>
                    </div> : !isPracticalPlace && <div className="mt-2 h-[86px] animate-pulse rounded-lg bg-slate-100"/>}
                  {!isPracticalPlace && <LocationStatusBadge status={locationStatuses[location.slug]}/>}
                </div>
              </Link>;
          })}
        </section>
      </main>
    </Layout>;
}
export const getStaticProps = translatedStaticProps('/cameras');
