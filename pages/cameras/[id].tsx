
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { cameras, Camera } from '../../components/cameraData';
import { fetchWeatherSnapshot, WeatherSnapshot } from '../../components/weather';

const CameraDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [camera, setCamera] = useState<Camera | null>(null);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);

  useEffect(() => {
    if (typeof id !== 'string') return;
    const found = cameras.find((c) => c.id === id);
    if (found) {
      setCamera(found);
      fetchWeatherSnapshot(found.latitude, found.longitude).then(setWeather);
    }
  }, [id]);

  if (!camera) {
    return (
      <Layout>
        <div className="mx-auto max-w-6xl px-4 py-6">Camera not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-6">
        <section className="grid gap-6 md:grid-cols-[2fr,1.2fr]">
          <div className="flex flex-col gap-4">
            <h1 className="text-xl md:text-2xl font-semibold text-navy">{camera.name}</h1>
            <p className="text-sm text-slate-600">
              {camera.region} · {camera.category.join(' · ')}{' '}
              {camera.altitudeMeters ? `· ${camera.altitudeMeters} m` : ''}
            </p>
            <div className="rounded-xl bg-black text-white overflow-hidden flex items-center justify-center h-64 md:h-80">
              {camera.youtubeId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${camera.youtubeId}?autoplay=0&mute=0`}
                  title={`${camera.name} live stream`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="p-4 text-center text-xs">
                  This camera currently opens on the original provider website.
                  Use the button below to watch the live stream.
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <a
                href={camera.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-ocean text-white text-xs font-medium hover:bg-ocean/90"
              >
                Open original source
              </a>
            </div>
          </div>
          <aside className="flex flex-col gap-4">
            <div className="rounded-xl bg-white border border-slate-200 p-4 text-sm">
              <h2 className="text-sm font-semibold text-navy mb-2">Current weather</h2>
              {weather ? (
                <div className="flex flex-col gap-1 text-xs text-slate-700">
                  <p>Temperature: {weather.temperature} °C</p>
                  <p>Wind speed: {weather.windSpeed} km/h</p>
                  <p>Weather code: {weather.weatherCode}</p>
                  <p className="mt-2 text-slate-500 text-[11px]">
                    Weather data via Open-Meteo. Always double-check conditions before driving into the mountains.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Weather data is loading or temporarily unavailable.</p>
              )}
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-4 text-xs text-slate-700 flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-navy mb-1">Travel tip</h2>
              <p>
                Use this webcam to check real-time conditions before you commit to a route. For mountain locations,
                compare at least two webcams and a forecast app.
              </p>
              <p>
                Madeira weather can change quickly, especially around Pico do Arieiro, Achada do Teixeira and Eira do
                Serrado. Plan buffers and drive carefully.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </Layout>
  );
};

export default CameraDetailPage;
