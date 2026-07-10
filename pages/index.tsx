
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { cameras } from '../components/cameraData';
import CameraCard from '../components/CameraCard';

const HomePage: React.FC = () => {
  const [query, setQuery] = useState('');
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
    'noopener,noreferrer'
  );
};

  const filtered = cameras.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.region.toLowerCase().includes(query.toLowerCase())
  );

  const featured = cameras.slice(0, 6);

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-6">
        <section className="grid gap-6 md:grid-cols-[2fr,1.2fr] items-start">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl md:text-3xl font-semibold text-navy">
              Check the weather. Choose your view. Explore Madeira.
            </h1>
            <p className="text-sm text-slate-600">
              See live conditions across Madeira before you drive to Pico do Arieiro, pick a beach in Machico,
              or visit the natural pools in Porto Moniz.
            </p>
            <div className="flex flex-col gap-3">
              <label className="text-xs font-medium text-slate-700">Search camera locations</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try Arieiro, Machico, Seixal, Porto Moniz..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean focus:border-ocean"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              {['Mountains','Beaches','Towns','Roads','Sunrise spots'].map((label) => (
                <span
                  key={label}
                  className="px-3 py-1 rounded-full bg-panel text-slate-700 border border-slate-200"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-4 text-xs text-slate-500 bg-white rounded-lg border border-slate-200 p-3">
              <p className="font-semibold mb-1">Weather planning tip</p>
              <p>
                Mountain webcams (Pico do Arieiro, Achada do Teixeira, Eira do Serrado) change fast with clouds and
                fog. Check them just before you leave, and compare at least two sources.
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4 flex flex-col gap-3">
  <div className="flex items-start justify-between gap-3">
    <div>
      <h2 className="font-semibold text-navy">
        Madeira Airport live camera
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        Watch live conditions at Cristiano Ronaldo Madeira International Airport
        (FNC / LPMA), including runway activity, cloud cover and visibility.
      </p>
    </div>

    <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600">
      LIVE
    </span>
  </div>

  <div className="aspect-video overflow-hidden rounded-lg bg-slate-900">
    <iframe
      className="h-full w-full"
      src="https://www.youtube.com/embed/Cai6b9-Nkgs?autoplay=0&mute=1"
      title="Madeira Airport live camera — FNC / LPMA"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  </div>

  <p className="text-[11px] text-slate-500">
    Live stream by Madeira Woman Spotter. Airport activity and weather conditions
    may change quickly.
  </p>

  <form
  onSubmit={trackFlight}
  className="mt-1 rounded-lg border border-slate-200 bg-panel p-3"
>
  <div className="flex flex-col gap-2">
    <div>
      <h3 className="text-sm font-semibold text-navy">
        Track a flight to Madeira
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        Enter a flight number to check its live status and position on
        Flightradar24.
      </p>
    </div>

    <div className="flex gap-2">
      <input
        type="text"
        value={flightNumber}
        onChange={(event) => setFlightNumber(event.target.value)}
        placeholder="Example: TP1685 or FR3824"
        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-ocean focus:ring-2 focus:ring-ocean/20"
        aria-label="Flight number"
      />

      <button
        type="submit"
        className="shrink-0 rounded-lg bg-ocean px-4 py-2 text-sm font-medium text-white hover:bg-ocean/90"
      >
        Track flight
      </button>
    </div>

    <p className="text-[11px] text-slate-500">
      Flight data opens on Flightradar24. Enter the airline code and flight
      number without spaces.
    </p>
  </div>
</form>
</div>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-navy">All cameras</h2>
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
