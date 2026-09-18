import { useState } from 'react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import LevadaNovaRoute from '../../components/LevadaNovaRoute';
import RestaurantPage from '../../components/RestaurantPage';
import ActivityPage from '../../components/ActivityPage';
import { getRestaurant, type Restaurant } from '../../data/restaurants';
import { getActivity } from '../../data/activities';
import {
  getLocalizedLocation, getLocationBySlug, locations, type Location,
} from '../../data/plannerLocations';
import { useMessages } from '../../lib/i18n/useMessages';

type Props = { location: Location; restaurant?: Restaurant | null; hasPhoto?: boolean };
type Coordinates = { latitude: number; longitude: number };
const navigationDestinations: Record<string, Coordinates> = {
  'cristo-rei': { latitude: 32.6395228, longitude: -16.8516118 },
  'monte-palace-tropical-garden': { latitude: 32.6748547, longitude: -16.9005373 },
  funchal: { latitude: 32.6476583, longitude: -16.9033456 },
  'mercado-dos-lavradores': { latitude: 32.6476583, longitude: -16.9033456 },
  'pico-ruivo': { latitude: 32.7649509, longitude: -16.9208276 },
  'levada-nova-levada-do-moinho': { latitude: 32.6896838, longitude: -17.0916296 },
  'calheta-beach': { latitude: 32.717068, longitude: -17.169304 },
  'praia-do-porto-do-seixal': { latitude: 32.8227967, longitude: -17.1023316 },
  'porto-moniz-natural-pools': { latitude: 32.866443, longitude: -17.1684326 },
  'ribeira-da-janela': { latitude: 32.8547476, longitude: -17.1537419 },
};

function StandardLocationPage({ location }: Props) {
  const { locale, messages } = useMessages();
  const router = useRouter();
  const display = getLocalizedLocation(location, locale);
  const uk = locale === 'uk';
  const [routeOpen, setRouteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = `https://madeiralivecams.com${uk ? '/uk' : ''}/explore/${display.slug}`;
  const image = `https://madeiralivecams.com${display.image}`;
  const destination = navigationDestinations[display.slug];
  const navigationQuery = destination
    ? `${destination.latitude},${destination.longitude}`
    : display.mapQuery;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(display.mapQuery)}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(navigationQuery)}&travelmode=driving`;
  const wazeUrl = destination
    ? `https://www.waze.com/ul?ll=${encodeURIComponent(navigationQuery)}&navigate=yes`
    : `https://www.waze.com/ul?q=${encodeURIComponent(navigationQuery)}&navigate=yes`;
  const actionClass = 'inline-flex h-10 items-center justify-center rounded-lg border border-ocean px-3 text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2';

  const handleBack = () => {
    if (router.query.returnTo === 'home') return void router.push('/?restoreCameraFilter=1');
    if (router.query.returnTo === 'cameras') return void router.push('/cameras?restore=1');
    if (window.history.length > 1) return void router.back();
    return void router.push('/cameras');
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: display.name,
          text: uk ? `Подивіться ${display.name} на Madeira Live Cams` : `See ${display.name} on Madeira Live Cams`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      window.prompt(uk ? 'Скопіюйте це посилання:' : 'Copy this link:', url);
    }
  };

  return (
    <Layout>
      <Head>
        <title>{display.name} | {messages.location.pageTitleSuffix}</title>
        <meta name="description" content={display.summary} />
        <meta property="og:title" content={`${display.name} | ${messages.location.ogTitleSuffix}`} />
        <meta property="og:description" content={display.summary} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="og:locale" content={uk ? 'uk_UA' : 'en_GB'} />
        <meta property="og:image" content={image} />
        <meta property="og:image:alt" content={display.imageAlt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${display.name} | Madeira Live Cams`} />
        <meta name="twitter:description" content={display.summary} />
        <meta name="twitter:image" content={image} />
      </Head>
      <main className="page-shell">
        <button type="button" onClick={handleBack} className={actionClass}>← {uk ? 'Назад' : 'Back'}</button>
        <article className="mx-auto mt-5 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[16/9] bg-slate-100">
            <Image src={display.image} alt={display.imageAlt} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
          </div>
          <div className="p-5 sm:p-8">
            <p className="text-sm font-medium text-ocean">{display.category} · {display.area}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{display.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/trip-plan?addLocation=${encodeURIComponent(display.slug)}`} className={`${actionClass} bg-ocean text-white`}>+ {uk ? 'До плану' : 'Add to plan'}</Link>
              <div className="relative">
                <button type="button" onClick={() => setRouteOpen((current) => !current)} aria-expanded={routeOpen} aria-controls="location-route-options" className={`${actionClass} bg-ocean text-white`}>
                  🗺️ {uk ? 'Маршрут' : 'Route'}
                </button>
                {routeOpen && (
                  <div id="location-route-options" className="absolute left-0 top-12 z-20 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-sm hover:bg-panel">Google Maps</a>
                    <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-sm hover:bg-panel">Waze</a>
                    <button type="button" onClick={() => setRouteOpen(false)} className="block w-full px-3 py-2 text-left text-sm">{uk ? 'Закрити' : 'Close'}</button>
                  </div>
                )}
              </div>
              <button type="button" onClick={share} className={actionClass}>{copied ? (uk ? 'Скопійовано' : 'Copied') : (uk ? 'Поділитися' : 'Share')}</button>
            </div>
            <p className="mt-5 text-base leading-7 text-slate-700">{display.article.intro}</p>
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-navy">{messages.location.history}</h2>
              <p className="mt-3 leading-7 text-slate-600">{display.article.history}</p>
            </section>
            {display.slug === 'levada-nova-levada-do-moinho' ? (
              <LevadaNovaRoute locale={locale} />
            ) : (
              <section className="mt-8">
                <h2 className="text-xl font-semibold text-navy">{messages.location.whyVisit}</h2>
                <ul className="mt-3 space-y-2 text-slate-600">
                  {display.article.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2 leading-6">
                      <span className="font-bold text-ocean" aria-hidden="true">•</span><span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section className="mt-8 rounded-xl bg-panel p-4">
              <h2 className="font-semibold text-navy">{messages.location.practicalTip}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{display.article.practicalTip}</p>
            </section>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={`${actionClass} mt-8`}>📍 {uk ? 'Відкрити точку на карті' : 'View location on map'}</a>
          </div>
        </article>
      </main>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: locations.flatMap((location) =>
    ['en', 'uk'].map((locale) => ({ params: { slug: location.slug }, locale }))),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug;
  const location = typeof slug === 'string' ? getLocationBySlug(slug) : undefined;
  if (!location) return { notFound: true };
  const restaurant = getRestaurant(location.slug) ?? getActivity(location.slug) ?? null;
  let hasPhoto = false;
  if (restaurant) {
    try {
      const { stat } = await import('node:fs/promises');
      const { join } = await import('node:path');
      const file = await stat(join(process.cwd(), 'public', restaurant.image));
      hasPhoto = file.isFile() && file.size > 0 && file.size <= 100000;
    } catch {
      hasPhoto = false;
    }
  }
  return { props: { location, restaurant, hasPhoto } };
};

export default function LocationPage(props: Props) {
  const activity = getActivity(props.location.slug);
  if (activity) return <ActivityPage restaurant={activity} hasPhoto={Boolean(props.hasPhoto)} />;
  return props.restaurant
    ? <RestaurantPage restaurant={props.restaurant} hasPhoto={Boolean(props.hasPhoto)} />
    : <StandardLocationPage {...props} />;
}
