import { useState } from 'react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useMessages } from '../../lib/i18n/useMessages';
import { getStayBySlug, stays, type Stay } from '../../data/stays';

type StayPageProps = {
  stay: Stay;
};

function googleMapsLocationUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

function googleMapsDirectionsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitude},${longitude}`)}&travelmode=driving`;
}

function wazeNavigationUrl(latitude: number, longitude: number) {
  return `https://www.waze.com/ul?ll=${encodeURIComponent(`${latitude},${longitude}`)}&navigate=yes`;
}

export default function StayPage({ stay }: StayPageProps) {
  const { locale } = useMessages();
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const copy = locale === 'uk'
    ? {
        back: 'Назад',
        route: 'Маршрут',
        share: 'Поділитися',
        copied: 'Скопійовано',
        closeRoute: 'Закрити вибір маршруту',
        close: 'Закрити',
        map: '📍 Відкрити точку на карті',
        intro: 'Інформація про віллу та зручна точка повернення для програми подорожі.',
        coordinates: 'Координати',
        routeTo: 'Маршрут до вілли',
        shareText: `Перегляньте ${stay.name} на Madeira Live Cams`,
      }
    : {
        back: 'Back',
        route: 'Route',
        share: 'Share',
        copied: 'Copied',
        closeRoute: 'Close route options',
        close: 'Close',
        map: '📍 View location on map',
        intro: 'Villa information and a convenient return point for a day-trip programme.',
        coordinates: 'Coordinates',
        routeTo: 'Route to the villa',
        shareText: `See ${stay.name} on Madeira Live Cams`,
      };

  const description = stay.shortDescription[locale];
  const pageUrl = `https://madeiralivecams.com/${locale}/stays/${stay.slug}`;

  const handleShare = async () => {
    const shareData = {
      title: `${stay.name} | Madeira Live Cams`,
      text: copy.shareText,
      url: pageUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(pageUrl);
      setShareStatus('copied');
      window.setTimeout(() => setShareStatus('idle'), 2000);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;

      try {
        await navigator.clipboard.writeText(pageUrl);
        setShareStatus('copied');
        window.setTimeout(() => setShareStatus('idle'), 2000);
      } catch {
        window.prompt(locale === 'uk' ? 'Скопіюйте це посилання:' : 'Copy this link:', pageUrl);
      }
    }
  };

  return (
    <Layout>
      <Head>
        <title>{stay.name} | Madeira Live Cams</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={`${stay.name} | Madeira Live Cams`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="Madeira Live Cams" />
        <meta property="og:locale" content={locale === 'uk' ? 'uk_UA' : 'en_GB'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${stay.name} | Madeira Live Cams`} />
        <meta name="twitter:description" content={description} />
      </Head>

      <main className="page-shell">
        <Link href="/trip-plan" locale={locale} className="inline-flex items-center gap-2 rounded-full border border-ocean/30 bg-white px-3 py-1.5 text-sm font-semibold text-ocean shadow-sm transition hover:-translate-x-0.5 hover:border-ocean hover:bg-ocean hover:text-white focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2">
          <span aria-hidden="true">←</span>
          <span>{copy.back}</span>
        </Link>

        <article className="mx-auto mt-5 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[16/9] bg-slate-100">
            <Image src="/images/cameras/madeira-camera-2.png" alt="Madeira map placeholder" fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
          </div>

          <div className="p-5 sm:p-8">
            <p className="text-sm font-medium text-ocean">{copy.routeTo}</p>

            <div className="mt-2">
              <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{stay.name}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <div className="relative">
                  <button type="button" onClick={() => setIsNavigationOpen((current) => !current)} aria-label={copy.route} aria-expanded={isNavigationOpen} title={copy.route} className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-ocean px-3 text-sm font-semibold text-white transition hover:bg-forest focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2">
                    <span aria-hidden="true">🗺️</span><span>{copy.route}</span>
                  </button>

                  {isNavigationOpen && (
                    <div className="absolute left-0 top-12 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                      <a href={googleMapsDirectionsUrl(stay.latitude, stay.longitude)} target="_blank" rel="noopener noreferrer" onClick={() => setIsNavigationOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy transition hover:bg-panel hover:text-ocean"><span aria-hidden="true">🗺️</span>Google Maps</a>
                      <a href={wazeNavigationUrl(stay.latitude, stay.longitude)} target="_blank" rel="noopener noreferrer" onClick={() => setIsNavigationOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy transition hover:bg-panel hover:text-ocean"><span aria-hidden="true">🚗</span>Waze</a>
                      <button type="button" onClick={() => setIsNavigationOpen(false)} aria-label={copy.closeRoute} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-navy"><span aria-hidden="true">×</span>{copy.close}</button>
                    </div>
                  )}
                </div>

                <button type="button" onClick={handleShare} aria-label={copy.share} title={copy.share} className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-ocean bg-white px-3 text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2"><span aria-hidden="true">↗</span><span>{shareStatus === 'copied' ? copy.copied : copy.share}</span></button>
              </div>
            </div>

            <p className="mt-5 text-base leading-7 text-slate-700">{description}</p>
            <p className="mt-3 text-base leading-7 text-slate-600">{copy.intro}</p>

            <section className="mt-8 rounded-xl bg-panel p-4">
              <h2 className="font-semibold text-navy">{copy.coordinates}</h2>
              <p className="mt-2 font-mono text-sm leading-6 text-slate-600">{stay.latitude.toFixed(6)}, {stay.longitude.toFixed(6)}</p>
            </section>

            <a href={googleMapsLocationUrl(stay.latitude, stay.longitude)} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex w-full items-center justify-center rounded-lg border border-ocean bg-white px-4 py-3 text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2 sm:w-auto">{copy.map}</a>
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

export const getStaticProps: GetStaticProps<StayPageProps> = async ({ params }) => {
  const slug = params?.slug;
  const stay = typeof slug === 'string' ? getStayBySlug(slug) : undefined;
  if (!stay) return { notFound: true };
  return { props: { stay } };
};