import React, { useState } from 'react';
import Layout from '../components/Layout';
import { cameras } from '../components/cameraData';
import CameraCard from '../components/CameraCard';
import { useMessages } from '../lib/i18n/useMessages';

const HomePage: React.FC = () => {
  const { messages } = useMessages();
  const [query] = useState('');
  const [flightNumber, setFlightNumber] = useState('');

  const trackFlight = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanFlightNumber = flightNumber
      .trim()
      .replace(/\s+/g, '')
      .toUpperCase();

    if (!cleanFlightNumber) return;

    window.open(
      `https://www.flightradar24.com/${cleanFlightNumber.toLowerCase()}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const filtered = cameras.filter(
    (camera) =>
      camera.name.toLowerCase().includes(query.toLowerCase()) ||
      camera.region.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Layout>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <section className="w-full">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-navy">
                  {messages.home.airportCameraTitle}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {messages.home.airportCameraDescription}
                </p>
              </div>

              <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600">
                {messages.home.live}
              </span>
            </div>

            <div className="aspect-video overflow-hidden rounded-lg bg-slate-900">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/0iDQDwx21Oo?autoplay=0&mute=1"
                title={messages.home.airportCameraTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <form
              onSubmit={trackFlight}
              className="mt-1 rounded-lg border border-slate-200 bg-panel p-3"
            >
              <div className="flex flex-col gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-navy">
                    {messages.home.flightTitle}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {messages.home.flightDescription}
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(event) => setFlightNumber(event.target.value)}
                    placeholder={messages.home.flightPlaceholder}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-ocean focus:ring-2 focus:ring-ocean/20"
                    aria-label={messages.home.flightAriaLabel}
                  />

                  <button
                    type="submit"
                    className="shrink-0 rounded-lg bg-ocean px-4 py-2 text-sm font-medium text-white hover:bg-ocean/90"
                  >
                    {messages.home.trackFlight}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-navy">
            {messages.home.allCameras}
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {filtered.map((camera) => (
              <CameraCard key={camera.id} camera={camera} />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;