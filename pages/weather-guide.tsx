import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useMessages } from '../lib/i18n/useMessages';

type SunriseDay = {
  date: string;
  sunrise: string;
  lowClouds: number;
  midClouds: number;
  highClouds: number;
  rainChance: number;
  windSpeed: number;
  windDirection: number;
};

type ForecastState = {
  loading: boolean;
  error: string | null;
  days: SunriseDay[];
};

const PICO_DO_ARIEIRO = {
  latitude: 32.7352,
  longitude: -16.928,
  cameraSourceUrl:
    'https://www.netmadeira.com/webcams-madeira/pico-do-arieiro',
};

function formatDate(date: string, locale: 'en' | 'uk') {
  return new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Atlantic/Madeira',
  }).format(new Date(`${date}T12:00:00`));
}

function formatSunrise(time: string, locale: 'en' | 'uk') {
  return new Intl.DateTimeFormat(locale === 'uk' ? 'uk-UA' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Atlantic/Madeira',
  }).format(new Date(time));
}

function windyCloudUrl(sunrise: string) {
  const [datePart, timePart] = sunrise.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  const offsetText =
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Atlantic/Madeira',
      timeZoneName: 'longOffset',
    })
      .formatToParts(new Date(Date.UTC(year, month - 1, day, 12)))
      .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';

  const match = offsetText.match(/GMT([+-])(\d{2}):?(\d{2})?/);

  const offsetMinutes = match
    ? (match[1] === '+' ? 1 : -1) *
      (Number(match[2]) * 60 + Number(match[3] ?? 0))
    : 0;

  const utcTime = new Date(
    Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60_000,
  );

  utcTime.setUTCHours(
    Math.floor(utcTime.getUTCHours() / 3) * 3,
    0,
    0,
    0,
  );

  const yyyy = utcTime.getUTCFullYear();
  const mm = String(utcTime.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(utcTime.getUTCDate()).padStart(2, '0');
  const hh = String(utcTime.getUTCHours()).padStart(2, '0');

  return `https://www.windy.com/?lclouds,${yyyy}-${mm}-${dd}-${hh},32.7352,-16.9280,11,d:picker`;
}

export default function WeatherGuidePage() {
  const { locale, messages } = useMessages();

  const [forecast, setForecast] = useState<ForecastState>({
    loading: true,
    error: null,
    days: [],
  });

  const cameraLabel = locale === 'uk' ? 'Онлайн камера' : 'Live camera';
  const windUnit = locale === 'uk' ? 'км/г' : 'km/h';

  const legend =
    locale === 'uk'
      ? {
          title: 'Позначення у прогнозі',
          sunrise: 'час сходу сонця',
          lowClouds: 'нижні хмари',
          midClouds: 'середні хмари',
          highClouds: 'високі хмари',
          rain: 'імовірність дощу',
          wind: 'швидкість і напрямок вітру',
          arrow: 'синя стрілка показує напрямок вітру',
        }
      : {
          title: 'Forecast symbols',
          sunrise: 'sunrise time',
          lowClouds: 'low clouds',
          midClouds: 'mid-level clouds',
          highClouds: 'high clouds',
          rain: 'rain probability',
          wind: 'wind speed and direction',
          arrow: 'the blue arrow shows wind direction',
        };

  function sunriseRating(day: SunriseDay) {
    const clearUpperSky = day.midClouds === 0 && day.highClouds === 0;
    const lowCloudsAreGood = day.lowClouds <= 70;
    const noRainRisk = day.rainChance === 0;
    const calmWind = day.windSpeed <= 5;

    if (clearUpperSky && lowCloudsAreGood && noRainRisk && calmWind) {
      return {
        ...messages.weatherGuide.ratings.excellent,
        className: 'border-moss bg-mist text-forest',
        icon: '☀️',
      };
    }

    if (clearUpperSky && lowCloudsAreGood && noRainRisk) {
      return {
        ...messages.weatherGuide.ratings.good,
        className: 'border-leaf/30 bg-leaf/10 text-forest',
        icon: '🌤️',
      };
    }

    if (day.rainChance > 0) {
      return {
        ...messages.weatherGuide.ratings.cloudyRisk,
        className: 'border-clay/50 bg-clay/15 text-[#7A4028]',
        icon: '🌧️',
      };
    }

    return {
      ...messages.weatherGuide.ratings.mixed,
      className: 'border-slate-300 bg-slate-100 text-slate-700',
      icon: '☁️',
    };
  }

  useEffect(() => {
    const loadForecast = async () => {
      try {
        const url =
          'https://api.open-meteo.com/v1/forecast' +
          `?latitude=${PICO_DO_ARIEIRO.latitude}` +
          `&longitude=${PICO_DO_ARIEIRO.longitude}` +
          '&hourly=cloud_cover_low,cloud_cover_mid,cloud_cover_high,precipitation_probability,wind_speed_10m,wind_direction_10m' +
          '&daily=sunrise' +
          '&forecast_days=8' +
          '&timezone=Atlantic%2FMadeira';

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(messages.weatherGuide.errorFallback);
        }

        const data = await response.json();

        const days: SunriseDay[] = data.daily.time
          .slice(1, 8)
          .map((date: string, forecastIndex: number) => {
            const index = forecastIndex + 1;
            const sunrise = data.daily.sunrise[index];
            const sunriseHour = sunrise.slice(0, 13) + ':00';

            const exactSunriseIndex = data.hourly.time.findIndex(
              (time: string) => time === sunriseHour,
            );

            const safeIndex =
              exactSunriseIndex >= 0 ? exactSunriseIndex : index * 24 + 7;

            return {
              date,
              sunrise,
              lowClouds: Math.round(data.hourly.cloud_cover_low[safeIndex] ?? 0),
              midClouds: Math.round(data.hourly.cloud_cover_mid[safeIndex] ?? 0),
              highClouds: Math.round(
                data.hourly.cloud_cover_high[safeIndex] ?? 0,
              ),
              rainChance: Math.round(
                data.hourly.precipitation_probability[safeIndex] ?? 0,
              ),
              windSpeed: Math.round(
                data.hourly.wind_speed_10m[safeIndex] ?? 0,
              ),
              windDirection: Math.round(
                data.hourly.wind_direction_10m[safeIndex] ?? 0,
              ),
            };
          });

        setForecast({
          loading: false,
          error: null,
          days,
        });
      } catch (error) {
        setForecast({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : messages.weatherGuide.errorFallback,
          days: [],
        });
      }
    };

    loadForecast();
  }, [messages.weatherGuide.errorFallback]);

  return (
    <Layout>
      <Head>
        <title>{messages.weatherGuide.pageTitle}</title>

        <meta
          name="description"
          content={messages.weatherGuide.pageDescription}
        />

        <link
          rel="canonical"
          href="https://madeiralivecams.com/weather-guide"
        />

        <meta property="og:title" content={messages.weatherGuide.pageTitle} />

        <meta
          property="og:description"
          content={messages.weatherGuide.ogDescription}
        />

        <meta
          property="og:url"
          content="https://madeiralivecams.com/weather-guide"
        />

        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main className="page-shell">
        <section className="relative isolate mb-6 overflow-hidden rounded-2xl bg-forest px-5 py-7 text-white shadow-lg shadow-forest/15 sm:px-8 sm:py-9">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-cover bg-center md:hidden"
            style={{
              backgroundImage: "url('/images/pico-radar-mobile.png')",
            }}
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 hidden bg-cover bg-center md:block"
            style={{
              backgroundImage: "url('/images/pico-radar-desktop.png')",
            }}
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-br from-[#092b22]/95 via-[#0b3d31]/82 to-[#11223b]/78"
          />

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss">
            {messages.weatherGuide.eyebrow}
          </p>

          <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            {messages.weatherGuide.title}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 sm:text-base">
            {messages.weatherGuide.intro}
          </p>
        </section>

        <section className="rounded-2xl border border-moss/60 bg-white p-3 shadow-sm sm:p-4">
          {forecast.loading && (
            <div className="rounded-xl border border-moss/40 bg-panel p-4 text-sm text-slate-600">
              {messages.weatherGuide.loading}
            </div>
          )}

          {forecast.error && (
            <div className="rounded-xl border border-lava/40 bg-lava/10 p-4 text-sm text-[#7A3021]">
              {forecast.error} {messages.weatherGuide.errorRetry}
            </div>
          )}

          {!forecast.loading && !forecast.error && (
            <div className="grid gap-2.5 lg:grid-cols-2">
              {forecast.days.map((day) => {
                const rating = sunriseRating(day);

                return (
                  <article
                    key={day.date}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-moss hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-navy">
                          {formatDate(day.date, locale)}
                        </h2>

                        <p className="text-xs text-slate-500">
                          ☀️ {formatSunrise(day.sunrise, locale)}
                        </p>
                      </div>

                      <div
                        className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${rating.className}`}
                        aria-label={`${rating.title}: ${rating.description}`}
                        title={`${rating.title}: ${rating.description}`}
                      >
                        <span aria-hidden="true">{rating.icon}</span>
                        <span>{rating.title}</span>
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-3 overflow-hidden rounded-lg border border-moss/30 bg-panel text-center">
                      <div
                        className="border-r border-moss/30 px-1.5 py-1.5"
                        title={messages.weatherGuide.lowClouds}
                      >
                        <p className="text-sm leading-4" aria-hidden="true">
                          ☁️⬇️
                        </p>

                        <p className="mt-0.5 text-sm font-semibold leading-4 text-navy">
                          {day.lowClouds}%
                        </p>
                      </div>

                      <div
                        className="border-r border-moss/30 px-1.5 py-1.5"
                        title={messages.weatherGuide.midClouds}
                      >
                        <p className="text-sm leading-4" aria-hidden="true">
                          ☁️
                        </p>

                        <p className="mt-0.5 text-sm font-semibold leading-4 text-navy">
                          {day.midClouds}%
                        </p>
                      </div>

                      <div
                        className="px-1.5 py-1.5"
                        title={messages.weatherGuide.highClouds}
                      >
                        <p className="text-sm leading-4" aria-hidden="true">
                          ☁️⬆️
                        </p>

                        <p className="mt-0.5 text-sm font-semibold leading-4 text-navy">
                          {day.highClouds}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-1.5 grid grid-cols-2 overflow-hidden rounded-lg border border-moss/30 bg-panel">
                      <div
                        className="flex items-center justify-center gap-1 border-r border-moss/30 px-2 py-1.5"
                        title={messages.weatherGuide.rainChance}
                      >
                        <span className="text-sm leading-4" aria-hidden="true">
                          🌧️
                        </span>

                        <span className="text-sm font-semibold leading-4 text-navy">
                          {day.rainChance}%
                        </span>
                      </div>

                      <div
                        className="flex items-center justify-center gap-1 px-2 py-1.5"
                        title={messages.weatherGuide.windAtSunrise}
                      >
                        <span className="text-sm leading-4" aria-hidden="true">
                          💨
                        </span>

                        <span className="text-sm font-semibold leading-4 text-navy">
                          {day.windSpeed} {windUnit}
                        </span>

                        <span
                          className="inline-flex h-4 w-4 items-center justify-center text-base font-bold leading-none text-ocean"
                          style={{
                            transform: `rotate(${day.windDirection}deg)`,
                          }}
                          aria-label={`${day.windDirection}°`}
                          title={`${day.windDirection}°`}
                        >
                          ↑
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex gap-1.5">
                      <a
                        href={PICO_DO_ARIEIRO.cameraSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center rounded-md border border-ocean bg-white px-2 py-1.5 text-xs font-semibold text-ocean transition hover:bg-ocean hover:text-white focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2"
                      >
                        {cameraLabel}
                      </a>

                      <a
                        href={windyCloudUrl(day.sunrise)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center rounded-md bg-ocean px-2 py-1.5 text-xs font-semibold text-white transition hover:bg-forest focus:outline-none focus:ring-2 focus:ring-leaf focus:ring-offset-2"
                      >
                        Windy
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <section className="mt-4 rounded-lg border border-moss/30 bg-mist px-3 py-3 text-xs leading-5 text-slate-600">
            <h2 className="text-sm font-semibold text-navy">{legend.title}</h2>

            <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
              <p>
                <span aria-hidden="true">☀️</span> — {legend.sunrise}
              </p>

              <p>
                <span aria-hidden="true">☁️⬇️</span> — {legend.lowClouds}
              </p>

              <p>
                <span aria-hidden="true">☁️</span> — {legend.midClouds}
              </p>

              <p>
                <span aria-hidden="true">☁️⬆️</span> — {legend.highClouds}
              </p>

              <p>
                <span aria-hidden="true">🌧️</span> — {legend.rain}
              </p>

              <p>
                <span aria-hidden="true">💨</span> — {legend.wind}
              </p>
            </div>

            <p className="mt-2 text-slate-500">
              <span
                className="mr-1 inline-flex h-4 w-4 items-center justify-center text-base font-bold leading-none text-ocean"
                aria-hidden="true"
              >
                ↑
              </span>
              {legend.arrow}
            </p>
          </section>
        </section>
      </main>
    </Layout>
  );
}