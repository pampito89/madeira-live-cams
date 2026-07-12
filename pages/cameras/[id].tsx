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

export default function CameraPage({ camera }: CameraPageProps) {
  const { locale, messages } = useMessages();
  const displayCamera = getLocalizedCamera(camera, locale);

  return (
    <Layout>
      <Head>
        <title>
          {displayCamera.name} | Madeira Live Cams
        </title>

        <meta
          name="description"
          content={`${displayCamera.name}: ${displayCamera.region}. Live camera and current conditions in Madeira.`}
        />
      </Head>

      <main className="page-shell">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-ocean hover:underline"
        >
          ← {messages.home.allCameras}
        </Link>

        <section className="mt-5 grid gap-6 md:grid-cols-[2fr,1.2fr]">
          <div className="flex flex-col gap-4">
            <h1 className="text-xl font-semibold text-navy md:text-2xl">
              {displayCamera.name}
            </h1>

            <p className="text-sm text-slate-600">
              {displayCamera.region} ·{' '}
              {displayCamera.category.join(' · ')}{' '}
              {displayCamera.altitudeMeters
                ? `· ${displayCamera.altitudeMeters} m`
                : ''}
            </p>

            <div className="aspect-video overflow-hidden rounded-xl bg-slate-900">
              {displayCamera.youtubeId ? (
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${displayCamera.youtubeId}?autoplay=0&mute=1`}
                  title={`${displayCamera.name} ${messages.cameraCard.liveStreamTitleSuffix}`}
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
          </div>

          <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-navy">
              {messages.cameraCard.watchDetails}
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">{messages.cameraCard.region}</dt>
                <dd className="mt-1 font-medium text-navy">
                  {displayCamera.region}
                </dd>
              </div>

              {displayCamera.altitudeMeters && (
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

            <a
              href={displayCamera.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-panel px-4 py-3 text-sm font-semibold text-navy transition hover:bg-mist"
            >
              {messages.cameraCard.openOriginalSource}
            </a>
          </aside>
        </section>
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