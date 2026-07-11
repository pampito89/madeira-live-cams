import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useMessages } from '../../lib/i18n/useMessages';
// TypeScript may sometimes fail to resolve the data module's types in some setups.
// Suppress the module-not-found type error for this import here.
// @ts-ignore: Module resolution for '../../data/locations' can vary by environment
import {
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
  const { messages } = useMessages();
  return (
    <Layout>
      <Head>
        <title>{location.name} | Madeira Travel Guide</title>

        <meta name="description" content={location.summary} />

        <link
          rel="canonical"
          href={`https://madeiralivecams.com/explore/${location.slug}`}
        />

        <meta property="og:title" content={`${location.name} | Madeira`} />
        <meta property="og:description" content={location.summary} />
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
              src={location.image}
              alt={location.imageAlt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>

          <div className="p-5 sm:p-8">
            <p className="text-sm font-medium text-ocean">
              {location.category} · {location.area}
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
              {location.name}
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-700">
              {location.article.intro}
            </p>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-navy">
                {messages.location.history}
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                {location.article.history}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-navy">{messages.location.whyVisit}</h2>

              <ul className="mt-3 space-y-2 text-slate-600">
                {location.article.highlights.map((highlight) => (
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
              <h2 className="font-semibold text-navy">{messages.location.practicalTip}</h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {location.article.practicalTip}
              </p>
            </section>

            <a
              href={mapUrl(location.mapQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-[#4A939C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#34737B] sm:w-auto"
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