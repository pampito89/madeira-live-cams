import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useMessages } from '../../lib/i18n/useMessages';
import { cameraPageText } from '../../lib/i18n/cameraPage';
import { translateCameraLabel } from '../../lib/i18n/cameraUi';
import { localePath, supportedLocales } from '../../lib/i18n/config';
import Layout from '../../components/Layout';
import { cameras, getLocalizedCamera, type Camera } from '../../components/cameraData';

type CameraPageProps = { camera: Camera };

const SITE_URL = 'https://madeiralivecams.com';
const AIRPORT_ARRIVALS_URL = 'https://www.madeiraairport.pt/en/fnc/flights-destinations/find-flights/real-time-arrivals?language=en';
const AIRPORT_DEPARTURES_URL = 'https://www.madeiraairport.pt/en/fnc/flights-destinations/find-flights/real-time-departures';

export default function CameraPage({ camera }: CameraPageProps) {
  const { locale, siteLocale, messages } = useMessages();
  const displayCamera = getLocalizedCamera(camera, locale);
  const text = cameraPageText[siteLocale];
  const isAirport = camera.id === 'madeira-airport';
  const region = translateCameraLabel(siteLocale, displayCamera.region);
  const pageTitle = isAirport ? text.airportTitle : text.title(displayCamera.name);
  const description = isAirport ? text.airportDescription : text.description(displayCamera.name, region);
  const heading = isAirport ? text.airportHeading : text.heading(displayCamera.name);
  const intro = isAirport ? text.airportIntro : text.intro(displayCamera.name);
  const canonicalUrl = `${SITE_URL}${localePath(siteLocale, `/cameras/${camera.id}`)}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle,
    description,
    url: canonicalUrl,
    isPartOf: { '@type': 'WebSite', name: 'Madeira Live Cams', url: SITE_URL },
    about: {
      '@type': 'Place',
      name: displayCamera.name,
      geo: { '@type': 'GeoCoordinates', latitude: displayCamera.latitude, longitude: displayCamera.longitude },
    },
  };

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      </Head>

      <main className="page-shell">
        <Link href="/#all-cameras-title" className="inline-flex text-sm font-medium text-ocean hover:underline">
          ← {messages.home.allCameras}
        </Link>

        <article className="mt-5">
          <header className="max-w-3xl">
            <h1 className="text-2xl font-semibold tracking-tight text-navy md:text-3xl">{heading}</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">{intro}</p>
          </header>

          <section className="mt-6 grid gap-6 md:grid-cols-[2fr,1.2fr]">
            <div className="flex flex-col gap-4">
              <div className="aspect-video overflow-hidden rounded-xl bg-slate-900">
                {displayCamera.youtubeId ? (
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${displayCamera.youtubeId}?autoplay=0&mute=1`}
                    title={`${displayCamera.name} ${messages.cameraCard.liveStreamTitleSuffix}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-ocean/20 via-panel to-clay/20 p-6 text-center">
                    <p className="text-sm text-slate-600">{messages.cameraCard.streamOnSource}</p>
                    <a href={displayCamera.sourceUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-ocean px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest">
                      {messages.cameraCard.openLiveCamera}
                    </a>
                  </div>
                )}
              </div>
              <p className="text-xs leading-5 text-slate-500">{text.streamNotice}</p>
            </div>

            <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-navy">{isAirport ? text.airportInfo : messages.cameraCard.watchDetails}</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">{messages.cameraCard.region}</dt>
                  <dd className="mt-1 font-medium text-navy">{region}</dd>
                </div>
                {displayCamera.altitudeMeters !== undefined ? (
                  <div>
                    <dt className="text-slate-500">{messages.cameraCard.altitude}</dt>
                    <dd className="mt-1 font-medium text-navy">{displayCamera.altitudeMeters} m</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-slate-500">{messages.cameraCard.coordinates}</dt>
                  <dd className="mt-1 font-medium text-navy">{displayCamera.latitude.toFixed(3)}, {displayCamera.longitude.toFixed(3)}</dd>
                </div>
              </dl>

              {isAirport ? (
                <div className="mt-5 grid gap-2">
                  <a href={AIRPORT_ARRIVALS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-ocean px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-forest">{text.arrivals}</a>
                  <a href={AIRPORT_DEPARTURES_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-ocean px-4 py-2 text-center text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white">{text.departures}</a>
                </div>
              ) : null}

              <a href={displayCamera.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-panel px-4 py-3 text-sm font-semibold text-navy transition hover:bg-mist">
                {messages.cameraCard.openOriginalSource}
              </a>
            </aside>
          </section>

          <section className="mt-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-navy">{text.checkHeading}</h2>
            <p className="mt-2 leading-7 text-slate-600">{isAirport ? text.airportCheck : text.cameraCheck}</p>
            <Link href="/weather-guide" className="mt-3 inline-flex text-sm font-semibold text-ocean hover:underline">{text.weatherLink} →</Link>
          </section>
        </article>
      </main>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: cameras.flatMap((camera) => supportedLocales.map((locale) => ({ params: { id: camera.id }, locale }))),
  fallback: false,
});

export const getStaticProps: GetStaticProps<CameraPageProps> = async ({ params }) => {
  const id = params?.id;
  const camera = typeof id === 'string' ? cameras.find((item) => item.id === id) : undefined;
  if (!camera) return { notFound: true };
  return { props: { camera } };
};
