import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Head from 'next/head';

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
};

function windDirectionLabel(degrees: number) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Atlantic/Madeira',
  }).format(new Date(`${date}T12:00:00`));
}

function formatSunrise(time: string) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Atlantic/Madeira',
  }).format(new Date(time));
}
function sunriseRating(day: SunriseDay) {
  const clearUpperSky = day.midClouds === 0 && day.highClouds === 0;
  const lowCloudsAreGood = day.lowClouds <= 70;
  const noRainRisk = day.rainChance === 0;
  const calmWind = day.windSpeed <= 5;

  if (clearUpperSky && lowCloudsAreGood && noRainRisk && calmWind) {
    return {
      title: 'Excellent',
      description: 'Strong chance of a clear and calm sunrise.',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  if (clearUpperSky && lowCloudsAreGood && noRainRisk) {
    return {
      title: 'Good',
      description: 'Good sunrise potential; wind may affect comfort.',
      className: 'bg-green-50 text-green-700 border-green-200',
    };
  }

  if (day.rainChance > 0) {
    return {
      title: 'Cloudy risk',
      description: 'Rain risk often means cloudier conditions at sunrise.',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  return {
    title: 'Mixed',
    description: 'Cloud layers may reduce visibility or colour.',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  };
}
function windyCloudUrl(sunrise: string) {
  const [datePart, timePart] = sunrise.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  // Madeira can be GMT or GMT+1. Read its correct offset for this date.
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

  // Convert Madeira sunrise time to UTC.
  const utcTime = new Date(
    Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60_000
  );

  // Windy accepts 3-hour UTC forecast steps: 00, 03, 06, 09, etc.
  utcTime.setUTCHours(Math.floor(utcTime.getUTCHours() / 3) * 3, 0, 0, 0);

  const yyyy = utcTime.getUTCFullYear();
  const mm = String(utcTime.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(utcTime.getUTCDate()).padStart(2, '0');
  const hh = String(utcTime.getUTCHours()).padStart(2, '0');

  return `https://www.windy.com/?lclouds,${yyyy}-${mm}-${dd}-${hh},32.7352,-16.9280,11,d:picker`;
}
export default function WeatherGuidePage() {
  const [forecast, setForecast] = useState<ForecastState>({
    loading: true,
    error: null,
    days: [],
  });

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
          throw new Error('Weather service is temporarily unavailable.');
        }

        const data = await response.json();

        const days: SunriseDay[] = data.daily.time
  .slice(1, 8)
  .map((date: string, forecastIndex: number) => {
    const index = forecastIndex + 1;
    const sunrise = data.daily.sunrise[index];

    const sunriseHour = sunrise.slice(0, 13) + ':00';

    const exactSunriseIndex = data.hourly.time.findIndex(
      (time: string) => time === sunriseHour
    );

    const safeIndex =
      exactSunriseIndex >= 0 ? exactSunriseIndex : index * 24 + 7;

    return {
      date,
      sunrise,
      lowClouds: Math.round(data.hourly.cloud_cover_low[safeIndex] ?? 0),
      midClouds: Math.round(data.hourly.cloud_cover_mid[safeIndex] ?? 0),
      highClouds: Math.round(data.hourly.cloud_cover_high[safeIndex] ?? 0),
      rainChance: Math.round(
        data.hourly.precipitation_probability[safeIndex] ?? 0
      ),
      windSpeed: Math.round(data.hourly.wind_speed_10m[safeIndex] ?? 0),
      windDirection: Math.round(
        data.hourly.wind_direction_10m[safeIndex] ?? 0
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
              : 'Could not load the sunrise forecast.',
          days: [],
        });
      }
    };

    loadForecast();
  }, []);

  return (
    <Layout>
        <Head>
  <title>Pico do Arieiro Sunrise Forecast | Madeira Live Cams</title>

  <meta
    name="description"
    content="Check the next 7 sunrise forecasts for Pico do Arieiro, Madeira. See low, mid and high cloud cover, rain chance, wind and sunrise conditions."
  />

  <link
    rel="canonical"
    href="https://madeiralivecams.com/weather-guide"
  />

  <meta
    property="og:title"
    content="Pico do Arieiro Sunrise Forecast | Madeira Live Cams"
  />

  <meta
    property="og:description"
    content="Plan your Pico do Arieiro sunrise with a 7-day cloud, rain and wind forecast."
  />

  <meta
    property="og:url"
    content="https://madeiralivecams.com/weather-guide"
  />

  <meta property="og:type" content="website" />

  <meta
    name="twitter:card"
    content="summary_large_image"
  />
</Head>
      <main className="page-shell">
        <section className="mb-6">
          <p className="text-sm font-medium text-ocean">Weather guide</p>

          <h1 className="mt-1 text-2xl font-semibold text-navy sm:text-3xl">
            Pico do Arieiro sunrise forecast
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Next seven sunrise forecasts at 1,818 m, starting tomorrow.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 rounded-xl bg-panel p-4 text-sm text-slate-600">
            <p className="font-semibold text-navy">How the rating works</p>
            <p className="mt-1">
            Ratings use the hourly forecast that contains the sunrise time at Pico do Arieiro.
            </p>
          </div>

          {forecast.loading && (
            <div className="rounded-xl bg-panel p-5 text-sm text-slate-600">
              Loading the 7-day sunrise forecast…
            </div>
          )}

          {forecast.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {forecast.error} Please try again shortly.
            </div>
          )}

          {!forecast.loading && !forecast.error && (
            <div className="grid gap-4 lg:grid-cols-2">
              {forecast.days.map((day) => {
                const rating = sunriseRating(day);

                return (
                  <article
                    key={day.date}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-navy">
                          {formatDate(day.date)}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                        Sunrise: {formatSunrise(day.sunrise)} · Conditions at sunrise
                        </p>
                      </div>
                    </div>
                    <div
  className={`mt-4 rounded-xl border px-4 py-3 text-base font-semibold ${rating.className}`}
>
  <p>{rating.title} sunrise conditions</p>
  <p className="mt-1 text-sm font-normal opacity-90">
    {rating.description}
  </p>
</div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-panel p-3">
                        <p className="text-xs text-slate-500">Low clouds</p>
                        <p className="mt-1 font-semibold text-navy">
                          {day.lowClouds}%
                        </p>
                      </div>

                      <div className="rounded-lg bg-panel p-3">
                        <p className="text-xs text-slate-500">Mid clouds</p>
                        <p className="mt-1 font-semibold text-navy">
                          {day.midClouds}%
                        </p>
                      </div>

                      <div className="rounded-lg bg-panel p-3">
                        <p className="text-xs text-slate-500">High clouds</p>
                        <p className="mt-1 font-semibold text-navy">
                          {day.highClouds}%
                        </p>
                      </div>

                      <div className="rounded-lg bg-panel p-3">
                        <p className="text-xs text-slate-500">Rain chance</p>
                        <p className="mt-1 font-semibold text-navy">
                          {day.rainChance}%
                        </p>
                      </div>

                      <div className="col-span-2 rounded-lg bg-panel p-3">
                        <p className="text-xs text-slate-500">Wind at sunrise</p>
                        <p className="mt-1 font-semibold text-navy">
                          {day.windSpeed} km/h ·{' '}
                          {windDirectionLabel(day.windDirection)}
                        </p>
                      </div>
                    </div>
                    <a
  href={windyCloudUrl(day.sunrise)}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#4A939C] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#34737B]"
>
  Open in Windy
</a>
                  </article>
                );
              })}
            </div>
          )}

          <p className="mt-5 text-xs text-slate-500">
            Forecast guidance only. Mountain weather and cloud cover can change
            quickly; check the live Pico do Arieiro camera before leaving.
          </p>
        </section>
      </main>
    </Layout>
  );
}