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

function mapUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`;
}

export default function LocationPage({ location }: LocationPageProps) {
  const { locale, messages } = useMessages();
  const displayLocation = getLocalizedLocation(location, locale);

  return (
    <Layout>
      <Head>
        <title>
          {displayLocation.name} | {messages.location.pageTitleSuffix}
        </title>

        <meta name="description" content={displayLocation.summary} />

        <link
          rel="canonical"
          href={`https://madeiralivecams.com/explore/${displayLocation.slug}`}
        />

        <meta
          property="og:title"
          content={`${displayLocation.name} | ${messages.location.ogTitleSuffix}`}
        />

        <meta property="og:description" content={displayLocation.summary} />
        <meta property="og:type" content="article" />
      </Head>

      <main className="page-shell">
        <Link
          href="/cameras"
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

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
              {displayLocation.name}
            </h1>

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
              href={mapUrl(displayLocation.mapQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-ocean px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest sm:w-auto"
            >
              {messages.location.openMaps}
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