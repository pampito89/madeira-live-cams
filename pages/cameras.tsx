import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getLocalizedLocation, locations } from '../data/locations';
import { locationCoordinates } from '../lib/locationWeather';
import { useMessages } from '../lib/i18n/useMessages';

type CurrentWeather = {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  time: string;
};

type WeatherByLocation = Record<string, CurrentWeather>;

function getWeatherDetails(code: number, locale: 'en' | 'uk') {
  const weather = {
    clear: {
      icon: '☀️',
      en: 'Clear',
      uk: 'Сонячно',
    },
    partlyCloudy: {
      icon: '🌤️',
      en: 'Partly cloudy',
      uk: 'Мінлива хмарність',
    },
    cloudy: {
      icon: '☁️',
      en: 'Cloudy',
      uk: 'Хмарно',
    },
    fog: {
      icon: '🌫️',
      en: 'Fog',
      uk: 'Туман',
    },
    drizzle: {
      icon: '🌦️',
      en: 'Light rain',
      uk: 'Невеликий дощ',
    },
    rain: {
      icon: '🌧️',
      en: 'Rain',
      uk: 'Дощ',
    },
    snow: {
      icon: '❄️',
      en: 'Snow',
      uk: 'Сніг',
    },
    storm: {
      icon: '⛈️',
      en: 'Thunderstorm',
      uk: 'Гроза',
    },
  };

  let condition = weather.cloudy;

  if (code === 0) {
    condition = weather.clear;
  } else if (code === 1 || code === 2) {
    condition = weather.partlyCloudy;
  } else if (code === 3) {
    condition = weather.cloudy;
  } else if (code === 45 || code === 48) {
    condition = weather.fog;
  } else if ([51, 53, 55, 56, 57].includes(code)) {
    condition = weather.drizzle;
  } else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    condition = weather.rain;
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    condition = weather.snow;
  } else if ([95, 96, 99].includes(code)) {
    condition = weather.storm;
  }

  return {
    icon: condition.icon,
    label: condition[locale],
  };
}

function getWindDirection(degrees: number, locale: 'en' | 'uk') {
  const directions =
    locale === 'uk'
      ? [
          'Північний',
          'Північно-східний',
          'Східний',
          'Південно-східний',
          'Південний',
          'Південно-західний',
          'Західний',
          'Північно-західний',
        ]
      : [
          'North',
          'North-east',
          'East',
          'South-east',
          'South',
          'South-west',
          'West',
          'North-west',
        ];

  return directions[Math.round(degrees / 45) % 8];
}

function getWindArrow(degrees: number) {
  const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];

  return arrows[Math.round(degrees / 45) % 8];
}

function formatUpdatedTime(time: string, locale: 'en' | 'uk') {
  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(
    locale === 'uk' ? 'uk-UA' : 'en-GB',
    {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Atlantic/Madeira',
    },
  ).format(date);
}

export default function CamerasPage() {
  const { locale, messages } = useMessages();
  const [activeFilter, setActiveFilter] = useState('All');
  const [weatherByLocation, setWeatherByLocation] =
    useState<WeatherByLocation>({});

  useEffect(() => {
    const weatherLocations = locations.filter(
      (location) => locationCoordinates[location.slug],
    );

    const latitude = weatherLocations
      .map((location) => locationCoordinates[location.slug].latitude)
      .join(',');

    const longitude = weatherLocations
      .map((location) => locationCoordinates[location.slug].longitude)
      .join(',');

    async function loadWeather() {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m&timezone=Europe%2FLisbon`,
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const results = Array.isArray(data) ? data : [data];
        const nextWeather: WeatherByLocation = {};

        results.forEach((result, index) => {
          const location = weatherLocations[index];
          const current = result.current;

          if (!location || !current) {
            return;
          }

          nextWeather[location.slug] = {
            temperature: Math.round(current.temperature_2m),
            weatherCode: current.weather_code,
            windSpeed: Math.round(current.wind_speed_10m),
            windDirection: current.wind_direction_10m,
            time: current.time,
          };
        });

        setWeatherByLocation(nextWeather);
      } catch {
        setWeatherByLocation({});
      }
    }

    loadWeather();
  }, []);

  const filters = [
    { value: 'All', label: messages.exploreList.filters.all },
    {
      value: 'Viewpoints',
      label: messages.exploreList.filters.viewpoints,
    },
    {
      value: 'Hiking',
      label: messages.exploreList.filters.hiking,
    },
    {
      value: 'Beaches',
      label: messages.exploreList.filters.beaches,
    },
    {
      value: 'City & culture',
      label: messages.exploreList.filters.cityCulture,
    },
    {
      value: 'Levada walks',
      label: messages.exploreList.filters.levadaWalks,
    },
  ];

  const filteredLocations = useMemo(() => {
    if (activeFilter === 'All') {
      return locations;
    }

    return locations.filter((location) =>
      location.tags.includes(activeFilter),
    );
  }, [activeFilter]);

  return (
    <Layout>
      <Head>
        <title>{messages.exploreList.pageTitle}</title>

        <meta
          name="description"
          content={messages.exploreList.pageDescription}
        />

        <link rel="canonical" href="https://madeiralivecams.com/cameras" />
      </Head>

      <main className="page-shell">
        <section className="max-w-3xl">
          <p className="text-sm font-medium text-ocean">
            {messages.exploreList.eyebrow}
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-navy sm:text-3xl">
            {messages.exploreList.title}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            {messages.exploreList.intro}
          </p>
        </section>

        <section
          className="mt-6"
          aria-label={messages.exploreList.filterAriaLabel}
        >
          <p className="text-sm font-semibold text-navy">
            {messages.exploreList.browseByInterest}
          </p>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'border-ocean bg-ocean text-white'
                      : 'border-slate-200 bg-white text-navy hover:border-ocean hover:text-ocean'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {messages.exploreList.showing} {filteredLocations.length}{' '}
            {messages.exploreList.of} {locations.length}{' '}
            {messages.exploreList.places}
          </p>
        </section>

        <section
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label={messages.exploreList.locationsAriaLabel}
        >
          {filteredLocations.map((location) => {
            const displayLocation = getLocalizedLocation(location, locale);
            const weather = weatherByLocation[location.slug];
            const weatherDetails = weather
              ? getWeatherDetails(weather.weatherCode, locale)
              : null;

            return (
              <Link
                key={displayLocation.slug}
                href={`/explore/${displayLocation.slug}`}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-leaf hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ocean">
                    {displayLocation.category}
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-navy">
                    {displayLocation.name}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {displayLocation.area}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {displayLocation.summary}
                  </p>

                  <span className="mt-4 inline-block text-sm font-semibold text-ocean group-hover:underline">
                    {messages.exploreList.readGuide}
                  </span>
                </div>

                <div className="w-20 shrink-0 sm:w-24">
                  <div className="relative h-20 overflow-hidden rounded-xl bg-mist sm:h-24">
                    <Image
                      src={displayLocation.image}
                      alt={displayLocation.imageAlt}
                      fill
                      unoptimized
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 80px, 96px"
                    />
                  </div>

                  {weather && weatherDetails ? (
                    <div className="mt-2 rounded-lg border border-slate-200 bg-panel px-2 py-2 text-xs text-slate-600">
                      <p className="flex items-center gap-1 font-semibold text-navy">
                        <span aria-hidden="true">{weatherDetails.icon}</span>
                        <span>{weather.temperature}°C</span>
                      </p>

                      <p className="mt-1 leading-4">
                        {weatherDetails.label}
                      </p>

                      <p
                        className="mt-1 leading-4"
                        title={`${getWindDirection(
                          weather.windDirection,
                          locale,
                        )}, ${weather.windSpeed} ${
                          locale === 'uk' ? 'км/год' : 'km/h'
                        }`}
                      >
                        <span className="font-semibold text-ocean" aria-hidden="true">
                          {getWindArrow(weather.windDirection)}
                        </span>{' '}
                        {weather.windSpeed} {locale === 'uk' ? 'км/год' : 'km/h'}
                      </p>

                      <p className="mt-1 text-[10px] leading-3 text-slate-400">
                        {locale === 'uk' ? 'Оновлено' : 'Updated'}{' '}
                        {formatUpdatedTime(weather.time, locale)}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 h-[86px] animate-pulse rounded-lg bg-slate-100" />
                  )}
                </div>
              </Link>
            );
          })}
        </section>
      </main>
    </Layout>
  );
}