import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useMessages } from '../../lib/i18n/useMessages';
import Layout from '../../components/Layout';
import {
  cameras,
  getLocalizedCamera,
  type Camera,
} from '../../components/cameraData';

type CameraPageProps = {
  camera: Camera;
};

const SITE_URL = 'https://madeiralivecams.com';
const AIRPORT_ARRIVALS_URL = 'https://www.madeiraairport.pt/en/fnc/flights-destinations/find-flights/real-time-arrivals?language=en';
const AIRPORT_DEPARTURES_URL = 'https://www.madeiraairport.pt/en/fnc/flights-destinations/find-flights/real-time-departures';

export default function CameraPage({ camera }: CameraPageProps) {
  const { locale, messages } = useMessages();
  const displayCamera = getLocalizedCamera(camera, locale);
  const uk = locale === 'uk';
  const isAirport = camera.id === 'madeira-airport';
  const pageTitle = isAirport
    ? uk
      ? 'Камера аеропорту Мадейри наживо (FNC), прибуття та вильоти'
      : 'Madeira Airport Live Webcam (FNC), Arrivals & Departures'
    : uk
      ? `${displayCamera.name}: вебкамера наживо | Madeira Live Cams`
      : `${displayCamera.name} Live Webcam, Madeira | Madeira Live Cams`;
  const description = isAirport
    ? uk
      ? 'Дивіться онлайн-камеру аеропорту Мадейри FNC та переходьте до офіційного статусу прибуттів і вильотів. Перевіряйте умови перед поїздкою.'
      : 'Watch the Madeira Airport FNC live webcam and open official real-time arrivals and departures. Check runway visibility and conditions before travelling.'
    : uk
      ? `${displayCamera.name}, ${displayCamera.region}: перегляньте вебкамеру наживо та перевірте поточні умови перед поїздкою.`
      : `Watch the ${displayCamera.name} live webcam in ${displayCamera.region}, Madeira, and check current visual conditions before you travel.`;
  const heading = isAirport
    ? uk
      ? 'Камера аеропорту Мадейри наживо (FNC)'
      : 'Madeira Airport live webcam (FNC)'
    : uk
      ? `${displayCamera.name}: вебкамера наживо`
      : `${displayCamera.name} live webcam`;
  const canonicalPath = `${uk ? '/uk' : ''}/cameras/${camera.id}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const intro = isAirport
    ? uk
      ? 'Камера показує район злітно-посадкової смуги міжнародного аеропорту Мадейри Cristiano Ronaldo (FNC/LPMA). Використовуйте відео для візуальної перевірки хмарності, видимості та загальних умов. Для точного статусу рейсу відкрийте офіційні дані аеропорту.'
      : 'This live view shows the runway area at Cristiano Ronaldo Madeira International Airport (FNC/LPMA). Use it to check cloud cover, visibility and general conditions. For an exact flight status, use the airport’s official arrivals and departures pages.'
    : uk
      ? `Перегляньте поточний вигляд у ${displayCamera.name}, перш ніж вирушати. Вебкамера допомагає оцінити хмарність і видимість, але не замінює офіційний прогноз або повідомлення про безпеку.`
      : `Check the current view at ${displayCamera.name} before setting out. The webcam can help you assess cloud cover and visibility, but it does not replace an official forecast or safety notice.`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle,
    description,
    url: canonicalUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Madeira Live Cams',
      url: SITE_URL,
    },
    about: {
      '@type': 'Place',
      name: displayCamera.name,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: displayCamera.latitude,
        longitude: displayCamera.longitude,
      },
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
        <Link
          href="/#all-cameras-title"
          className="inline-flex text-sm font-medium text-ocean hover:underline"
        >
          ← {messages.home.allCameras}
        </Link>

        <article className="mt-5">
          <header className="max-w-3xl">
            <h1 className="text-2xl font-semibold tracking-tight text-navy md:text-3xl">
              {heading}
            </h1>
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
                    <p className="text-sm text-slate-600">
                      {messages.cameraCard.streamOnSource}
                    </p>

                    <a
                      href={displayCamera.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-ocean px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest"
                    >
                      {messages.cameraCard.openLiveCamera}
                    </a>
                  </div>
                )}
              </div>

              <p className="text-xs leading-5 text-slate-500">
                {uk
                  ? 'Трансляція належить її джерелу та може бути тимчасово недоступною. Madeira Live Cams не керує камерою і не гарантує безперервність відео.'
                  : 'The stream belongs to its source and may be temporarily unavailable. Madeira Live Cams does not operate the camera or guarantee continuous video.'}
              </p>
            </div>

            <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-navy">
                {isAirport
                  ? uk ? 'Аеропорт і рейси' : 'Airport and flight information'
                  : messages.cameraCard.watchDetails}
              </h2>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">{messages.cameraCard.region}</dt>
                  <dd className="mt-1 font-medium text-navy">
                    {displayCamera.region}
                  </dd>
                </div>

                {displayCamera.altitudeMeters !== undefined && (
                  <div>
                    <dt className="text-slate-500">{messages.cameraCard.altitude}</dt>
                    <dd className="mt-1 font-medium text-navy">
                      {displayCamera.altitudeMeters} m
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-slate-500">{messages.cameraCard.coordinates}</dt>
                  <dd className="mt-1 font-medium text-navy">
                    {displayCamera.latitude.toFixed(3)},{' '}
                    {displayCamera.longitude.toFixed(3)}
                  </dd>
                </div>
              </dl>

              {isAirport && (
                <div className="mt-5 grid gap-2">
                  <a href={AIRPORT_ARRIVALS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-ocean px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-forest">
                    {uk ? 'Офіційні прибуття FNC' : 'Official FNC arrivals'}
                  </a>
                  <a href={AIRPORT_DEPARTURES_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-ocean px-4 py-2 text-center text-sm font-semibold text-ocean transition hover:bg-ocean hover:text-white">
                    {uk ? 'Офіційні вильоти FNC' : 'Official FNC departures'}
                  </a>
                </div>
              )}

              <a
                href={displayCamera.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-panel px-4 py-3 text-sm font-semibold text-navy transition hover:bg-mist"
              >
                {messages.cameraCard.openOriginalSource}
              </a>
            </aside>
          </section>

          <section className="mt-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-navy">
              {uk ? 'Що перевірити перед поїздкою' : 'What to check before travelling'}
            </h2>
            <p className="mt-2 leading-7 text-slate-600">
              {isAirport
                ? uk
                  ? 'Камера показує лише візуальні умови. Час прибуття, вильоту, затримку або скасування завжди перевіряйте на офіційному сайті аеропорту чи в авіакомпанії.'
                  : 'The webcam shows visual conditions only. Always confirm arrival time, departure time, delays or cancellations with the official airport or your airline.'
                : uk
                  ? 'Порівняйте зображення з актуальним прогнозом, врахуйте висоту й район острова та перевірте офіційні повідомлення, якщо плануєте гірський маршрут.'
                  : 'Compare the live view with the current forecast, account for the location and elevation, and check official notices before a mountain walk.'}
            </p>
            <Link href="/weather-guide" className="mt-3 inline-flex text-sm font-semibold text-ocean hover:underline">
              {uk ? 'Перевірити погоду та схід сонця' : 'Check weather and sunrise information'} →
            </Link>
          </section>
        </article>
      </main>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const locales = ['en', 'uk'];

  return {
    paths: cameras.flatMap((camera) =>
      locales.map((locale) => ({
        params: { id: camera.id },
        locale,
      })),
    ),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<CameraPageProps> = async ({
  params,
}) => {
  const id = params?.id;

  const camera =
    typeof id === 'string'
      ? cameras.find((item) => item.id === id)
      : undefined;

  if (!camera) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      camera,
    },
  };
};
