import { useState } from 'react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useMessages } from '../../lib/i18n/useMessages';
import { getStayBySlug, stays, type Stay } from '../../data/stays';

type Props = { stay: Stay };

export default function StayPage({ stay }: Props) {
  const { locale } = useMessages();
  const uk = locale === 'uk';
  const [routeOpen, setRouteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const description = stay.shortDescription[locale];
  const url = `https://madeiralivecams.com${uk ? '/uk' : ''}/stays/${stay.slug}`;
  const coordinates = `${stay.latitude},${stay.longitude}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coordinates)}&travelmode=driving`;
  const wazeUrl = `https://www.waze.com/ul?ll=${encodeURIComponent(coordinates)}&navigate=yes`;
  const actionClass = 'inline-flex h-10 items-center justify-center rounded-lg border border-ocean px-3 text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean focus-visible:ring-offset-2';

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${stay.name} | Madeira Live Cams`,
          text: uk ? `Перегляньте ${stay.name} на Madeira Live Cams` : `See ${stay.name} on Madeira Live Cams`,
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
        <title>{stay.name} | Madeira Live Cams</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${stay.name} | Madeira Live Cams`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="og:locale" content={uk ? 'uk_UA' : 'en_GB'} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={stay.name} />
        <meta name="twitter:description" content={description} />
      </Head>
      <main className="page-shell">
        <Link href="/trip-plan" locale={locale} className={actionClass}>← {uk ? 'Назад' : 'Back'}</Link>
        <article className="mx-auto mt-5 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[16/9] bg-slate-100">
            <Image src="/images/cameras/madeira-camera-2.png" alt={uk ? 'Карта Мадейри' : 'Madeira map'} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
          </div>
          <div className="p-5 sm:p-8">
            <p className="text-sm font-medium text-ocean">{uk ? 'Маршрут до вілли' : 'Route to the villa'}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{stay.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <div className="relative">
                <button type="button" onClick={() => setRouteOpen((current) => !current)} aria-expanded={routeOpen} aria-controls="stay-route-options" className={`${actionClass} bg-ocean text-white`}>
                  🗺️ {uk ? 'Маршрут' : 'Route'}
                </button>
                {routeOpen && (
                  <div id="stay-route-options" className="absolute left-0 top-12 z-20 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-sm hover:bg-panel">Google Maps</a>
                    <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 text-sm hover:bg-panel">Waze</a>
                    <button type="button" onClick={() => setRouteOpen(false)} className="block w-full px-3 py-2 text-left text-sm">{uk ? 'Закрити' : 'Close'}</button>
                  </div>
                )}
              </div>
              <button type="button" onClick={share} className={actionClass}>{copied ? (uk ? 'Скопійовано' : 'Copied') : (uk ? 'Поділитися' : 'Share')}</button>
            </div>
            <p className="mt-5 text-base leading-7 text-slate-700">{description}</p>
            <p className="mt-3 text-base leading-7 text-slate-600">
              {uk ? 'Інформація про віллу та точка повернення для програми подорожі.' : 'Villa information and a return point for a day-trip programme.'}
            </p>
            <section className="mt-8 rounded-xl bg-panel p-4">
              <h2 className="font-semibold text-navy">{uk ? 'Координати' : 'Coordinates'}</h2>
              <p className="mt-2 font-mono text-sm leading-6 text-slate-600">{stay.latitude.toFixed(6)}, {stay.longitude.toFixed(6)}</p>
            </section>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={`${actionClass} mt-8`}>📍 {uk ? 'Відкрити точку на карті' : 'View location on map'}</a>
          </div>
        </article>
      </main>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: stays.flatMap((stay) => ['en', 'uk'].map((locale) => ({ params: { slug: stay.slug }, locale }))),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug;
  const stay = typeof slug === 'string' ? getStayBySlug(slug) : undefined;
  if (!stay) return { notFound: true };
  return { props: { stay } };
};
