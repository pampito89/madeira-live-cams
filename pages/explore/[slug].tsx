import { useState } from 'react';
import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useMessages } from '../../lib/i18n/useMessages';
import {
  getLocalizedLocation,
  getLocationBySlug,
  locations,
  type Location,
} from '../../data/locations';

type LocationPageProps = {
  location: Location;
};

type NavigationDestination = {
  latitude: number;
  longitude: number;
};

const navigationDestinations: Record<string, NavigationDestination> = {
  'cristo-rei': {
    latitude: 32.6395228,
    longitude: -16.8516118,
  },
  'monte-palace-tropical-garden': {
    latitude: 32.6748547,
    longitude: -16.9005373,
  },
  funchal: {
    latitude: 32.6476583,
    longitude: -16.9033456,
  },
  'mercado-dos-lavradores': {
    latitude: 32.6476583,
    longitude: -16.9033456,
  },
  'pico-ruivo': {
    latitude: 32.7649509,
    longitude: -16.9208276,
  },
  'levada-nova-levada-do-moinho': {
    latitude: 32.6896838,
    longitude: -17.0916296,
  },
  'calheta-beach': {
    latitude: 32.717068,
    longitude: -17.169304,
  },
  'praia-do-porto-do-seixal': {
    latitude: 32.8227967,
    longitude: -17.1023316,
  },
  'porto-moniz-natural-pools': {
    latitude: 32.866443,
    longitude: -17.1684326,
  },
};

function googleMapsLocationUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`;
}

function googleMapsDirectionsUrl(destination: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination,
  )}&travelmode=driving`;
}

function wazeNavigationUrl(destination: string, usesCoordinates: boolean) {
  if (usesCoordinates) {
    return `https://www.waze.com/ul?ll=${encodeURIComponent(
      destination,
    )}&navigate=yes`;
  }

  return `https://www.waze.com/ul?q=${encodeURIComponent(
    destination,
  )}&navigate=yes`;
}

export default function LocationPage({ location }: LocationPageProps) {
  const { locale, messages } = useMessages();
  const displayLocation = getLocalizedLocation(location, locale);

  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const canonicalUrl = `https://madeiralivecams.com/${locale}/explore/${displayLocation.slug}`;

  const shareImageUrl = `https://madeiralivecams.com${displayLocation.image}`;

  const navigationDestination =
    navigationDestinations[displayLocation.slug];

  const navigationQuery = navigationDestination
    ? `${navigationDestination.latitude},${navigationDestination.longitude}`
    : displayLocation.mapQuery;

  const pageUrl = canonicalUrl;

  const locationText =
    locale === 'uk'
      ? {
          route: 'Маршрут',
          share: 'Поділитися',
          copied: 'Скопійовано',
          closeRoute: 'Закрити вибір маршруту',
          close: 'Закрити',
          map: '📍 Відкрити точку на карті',
          shareText: `Подивіться ${displayLocation.name} на Madeira Live Cams`,
        }
      : {
          route: 'Route',
          share: 'Share',
          copied: 'Copied',
          closeRoute: 'Close route options',
          close: 'Close',
          map: '📍 View location on map',
          shareText: `See ${displayLocation.name} on Madeira Live Cams`,
        };

  const handleShare = async () => {
    const shareData = {
      title: `${displayLocation.name} | Madeira Live Cams`,
      text: locationText.shareText,
      url: pageUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(pageUrl);
      setShareStatus('copied');

      window.setTimeout(() => {
        setShareStatus('idle');
      }, 2000);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      try {
        await navigator.clipboard.writeText(pageUrl);
        setShareStatus('copied');

        window.setTimeout(() => {
          setShareStatus('idle');
        }, 2000);
      } catch {
        window.prompt(
          locale === 'uk'
            ? 'Скопіюйте це посилання:'
            : 'Copy this link:',
          pageUrl,
        );
      }
    }
  };

  return (
    <Layout>
      <Head>
        <title>
          {displayLocation.name} | {messages.location.pageTitleSuffix}
        </title>

        <meta name="description" content={displayLocation.summary} />

        <link rel="canonical" href={canonicalUrl} />

        <meta
          property="og:title"
          content={`${displayLocation.name} | ${messages.location.ogTitleSuffix}`}
        />

        <meta property="og:description" content={displayLocation.summary} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Madeira Live Cams" />
        <meta
          property="og:locale"
          content={locale === 'uk' ? 'uk_UA' : 'en_GB'}
        />

        <meta property="og:image" content={shareImageUrl} />
        <meta property="og:image:secure_url" content={shareImageUrl} />
        <meta property="og:image:alt" content={displayLocation.imageAlt} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${displayLocation.name} | Madeira Live Cams`}
        />
        <meta name="twitter:description" content={displayLocation.summary} />
        <meta name="twitter:image" content={shareImageUrl} />
        <meta name="twitter:image:alt" content={displayLocation.imageAlt} />
      </Head>

      <main className="page-shell">
        <Link
          href="/cameras"
          locale={locale}
          className="inline-flex text-sm font-medium text-ocean hover:underline"
        >
          {messages.location.back}
        </Link>

        <article className="mx-auto mt-5 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[16/9] bg-slate-100">
            <Image
              src={displayLocation.image}
              alt={displayLocation.imageAlt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>

          <div className="p-5 sm:p-8">
            <p className="text-sm font-medium text-ocean">
              {displayLocation.category} · {displayLocation.area}
            </p>

            <div className="mt-2">
              <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
                {displayLocation.name}
              </h1>

              <div className="mt-3 flex flex-wrap gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setIsNavigationOpen((current) => !current)
                    }
                    aria-label={locationText.route}
                    aria-expanded={isNavigationOpen}
                    title={locationText.route}
                    className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-ocean px-3 text-sm font-semibold text-white transition hover:bg-forest focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2"
                  >
                    <span aria-hidden="true">🗺️</span>
                    <span>{locationText.route}</span>
                  </button>

                  {isNavigationOpen && (
                    <div className="absolute left-0 top-12 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                      <a
                        href={googleMapsDirectionsUrl(navigationQuery)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsNavigationOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy transition hover:bg-panel hover:text-ocean"
                      >
                        <span aria-hidden="true">🗺️</span>
                        Google Maps
                      </a>

                      <a
                        href={wazeNavigationUrl(
                          navigationQuery,
                          Boolean(navigationDestination),
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsNavigationOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-navy transition hover:bg-panel hover:text-ocean"
                      >
                        <span aria-hidden="true">🚗</span>
                        Waze
                      </a>

                      <button
                        type="button"
                        onClick={() => setIsNavigationOpen(false)}
                        aria-label={locationText.closeRoute}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-navy"
                      >
                        <span aria-hidden="true">×</span>
                        {locationText.close}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleShare}
                  aria-label={locationText.share}
                  title={locationText.share}
                  className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-ocean bg-white px-3 text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2"
                >
                  <span aria-hidden="true">↗</span>

                  <span>
                    {shareStatus === 'copied'
                      ? locationText.copied
                      : locationText.share}
                  </span>
                </button>
              </div>
            </div>

            <p className="mt-5 text-base leading-7 text-slate-700">
              {displayLocation.article.intro}
            </p>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-navy">
                {messages.location.history}
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                {displayLocation.article.history}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-navy">
                {messages.location.whyVisit}
              </h2>

              <ul className="mt-3 space-y-2 text-slate-600">
                {displayLocation.article.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2 leading-6">
                    <span className="font-bold text-ocean" aria-hidden="true">
                      •
                    </span>

                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8 rounded-xl bg-panel p-4">
              <h2 className="font-semibold text-navy">
                {messages.location.practicalTip}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {displayLocation.article.practicalTip}
              </p>
            </section>

            <a
              href={googleMapsLocationUrl(displayLocation.mapQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg border border-ocean bg-white px-4 py-3 text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2 sm:w-auto"
            >
              {locationText.map}
            </a>
          </div>
        </article>
      </main>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const locales = ['en', 'uk'];

  return {
    paths: locations.flatMap((location) =>
      locales.map((locale) => ({
        params: { slug: location.slug },
        locale,
      })),
    ),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<LocationPageProps> = async ({
  params,
}) => {
  const slug = params?.slug;

  const location =
    typeof slug === 'string' ? getLocationBySlug(slug) : undefined;

  if (!location) {
    return { notFound: true };
  }

  return {
    props: { location },
  };
};