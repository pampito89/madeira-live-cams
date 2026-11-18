import { useNavigationState } from '../lib/useNavigationMemory';
import { translatedStaticProps } from '../lib/i18n/pageTranslations';
import { useText } from '../lib/i18n/TranslationProvider';
import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../components/Layout';
import { cameras, type CameraCategory } from '../components/cameraData';
import CameraCard from '../components/CameraCard';
import { useMessages } from '../lib/i18n/useMessages';
import { homePageText } from '../lib/i18n/homePage';

const cameraFilters: CameraCategory[] = ['Mountains', 'Beaches', 'Towns', 'North Coast', 'South Coast', 'East Coast', 'Sunrise spots'];
const directoryCameras = cameras.filter(camera => camera.id !== 'madeira-airport' && !camera.hiddenFromHome);

export default function HomePage() {
    const { translate: localize } = useText();
    const { siteLocale, messages } = useMessages();
    const [activeFilter, setActiveFilter] = useNavigationState<CameraCategory | 'All'>('index:activeFilter', 'All');
    const [flightNumber, setFlightNumber] = useState('');
    const text = homePageText[siteLocale];
    const trackFlight = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const cleanFlightNumber = flightNumber.trim().replace(/\s+/g, '').toUpperCase();
        if (!cleanFlightNumber) return;
        window.open(`https://www.flightradar24.com/${cleanFlightNumber.toLowerCase()}`, '_blank', 'noopener,noreferrer');
    };
    const filtered = useMemo(() => activeFilter === 'All' ? directoryCameras : directoryCameras.filter(camera => camera.category.includes(activeFilter)), [activeFilter]);
    return <Layout>
      <Head>
        <title>{localize(text.title)}</title>
        <meta name="description" content={localize(text.description)}/>
        <meta property="og:title" content={localize(text.title)}/>
        <meta property="og:description" content={localize(text.description)}/>
        <meta property="og:type" content="website"/>
        <meta name="twitter:card" content="summary"/>
        <meta name="twitter:title" content={localize(text.title)}/>
        <meta name="twitter:description" content={localize(text.description)}/>
      </Head>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <header className="relative isolate overflow-hidden rounded-xl bg-navy px-5 py-5 text-white sm:px-7 sm:py-6">
          <Image src="/images/madeira-coast-heading-v1.png" alt="" fill priority sizes="(max-width: 1152px) calc(100vw - 32px), 1120px" className="pointer-events-none -z-20 object-cover object-right"/>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-navy/90 via-navy/65 to-navy/20"/>
          <div className="max-w-3xl sm:pr-16">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">{localize(text.heading)}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/95 sm:text-base">{localize(text.description)}</p>
          </div>
        </header>
        <section aria-labelledby="airport-camera-title">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="airport-camera-title" className="font-semibold text-navy">{localize(messages.home.airportCameraTitle)}</h2>
                <p className="mt-1 text-xs text-slate-500">{localize(messages.home.airportCameraDescription)}</p>
              </div>
              <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600">{localize(messages.home.live)}</span>
            </div>
            <div className="aspect-video overflow-hidden rounded-lg bg-slate-900">
              <iframe className="h-full w-full" src="https://www.youtube.com/embed/RFEGOudkDEc?autoplay=1&mute=1" title={localize(messages.home.airportCameraTitle)} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/>
            </div>
            <form onSubmit={trackFlight} className="mt-1 rounded-lg border border-slate-200 bg-panel p-3">
              <div className="flex flex-col gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-navy">{localize(messages.home.flightTitle)}</h3>
                  <p className="mt-1 text-xs text-slate-500">{localize(messages.home.flightDescription)}</p>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={flightNumber} onChange={event => setFlightNumber(event.target.value)} placeholder={localize(messages.home.flightPlaceholder)} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-ocean focus:ring-2 focus:ring-ocean/20" aria-label={localize(messages.home.flightAriaLabel)}/>
                  <button type="submit" className="shrink-0 rounded-lg bg-ocean px-4 py-2 text-sm font-medium text-white hover:bg-ocean/90">{localize(messages.home.trackFlight)}</button>
                </div>
              </div>
            </form>
          </div>
        </section>
        <section className="flex flex-col gap-3" aria-labelledby="all-cameras-title">
          <div>
            <h2 id="all-cameras-title" className="text-lg font-semibold text-navy">{localize(messages.home.allCameras)}</h2>
            <p className="mt-1 text-sm text-slate-500">{localize(text.showing(filtered.length, directoryCameras.length))}</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2" aria-label={localize(text.filtersLabel)}>
            <button type="button" aria-pressed={activeFilter === 'All'} onClick={() => setActiveFilter('All')} className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium transition ${activeFilter === 'All' ? 'border-ocean bg-ocean text-white' : 'border-slate-200 bg-white text-navy hover:border-ocean hover:text-ocean'}`}>{localize(text.all)}</button>
            {cameraFilters.map(filter => <button key={filter} type="button" aria-pressed={activeFilter === filter} onClick={() => setActiveFilter(filter)} className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium transition ${activeFilter === filter ? 'border-ocean bg-ocean text-white' : 'border-slate-200 bg-white text-navy hover:border-ocean hover:text-ocean'}`}>{localize(text.filters[filter])}</button>)}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {filtered.map(camera => <CameraCard key={camera.id} camera={camera}/>)}
          </div>
        </section>
      </div>
    </Layout>;
}
export const getStaticProps = translatedStaticProps('/');
