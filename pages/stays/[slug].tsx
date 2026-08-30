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

export default function StayPage({ stay }: StayPageProps) {
  const { locale } = useMessages();
  const description = stay.shortDescription[locale];
  const backLabel = locale === 'uk' ? 'Назад' : 'Back';
  const routeLabel = locale === 'uk' ? 'Побудувати маршрут' : 'Get directions';
  const coordinatesLabel = locale === 'uk' ? 'Координати' : 'Coordinates';

  return (
    <Layout>
      <Head>
        <title>{stay.name} | Madeira Live Cams</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://madeiralivecams.com/stays/${stay.slug}`} />
      </Head>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <Link href="/trip-plan" locale={locale} className="inline-flex items-center gap-2 rounded-full border border-ocean/30 bg-white px-3 py-1.5 text-sm font-semibold text-ocean shadow-sm transition hover:-translate-x-0.5 hover:border-ocean hover:bg-ocean hover:text-white">
          <span aria-hidden="true">←</span>
          <span>{backLabel}</span>
        </Link>

        <article className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
            <Image src="/images/cameras/madeira-camera-2.png" alt="Madeira map placeholder" fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
            <div className="absolute inset-0 bg-navy/35" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/80">Madeira Live Cams</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{stay.name}</h1>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <p className="text-base leading-7 text-slate-600">{description}</p>

            <div className="mt-6 rounded-xl bg-panel p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{coordinatesLabel}</p>
              <p className="mt-1 font-mono text-sm text-navy">{stay.latitude.toFixed(6)}, {stay.longitude.toFixed(6)}</p>
            </div>

            <a href={stay.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ocean px-4 py-3 text-sm font-bold text-white transition hover:bg-forest sm:w-auto">
              <span aria-hidden="true">🗺️</span>
              <span>{routeLabel}</span>
            </a>
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