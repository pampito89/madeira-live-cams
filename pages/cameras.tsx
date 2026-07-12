import { useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getLocalizedLocation, locations } from '../data/locations';
import { useMessages } from '../lib/i18n/useMessages';

export default function CamerasPage() {
  const { locale, messages } = useMessages();
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = [
    { value: 'All', label: messages.exploreList.filters.all },
    {
      value: 'Viewpoints',
      label: messages.exploreList.filters.viewpoints,
    },
    {
      value: 'Hiking',
      label: messages.exploreList.filters.hiking,
    },
    {
      value: 'Beaches',
      label: messages.exploreList.filters.beaches,
    },
    {
      value: 'City & culture',
      label: messages.exploreList.filters.cityCulture,
    },
    {
      value: 'Levada walks',
      label: messages.exploreList.filters.levadaWalks,
    },
  ];

  const filteredLocations = useMemo(() => {
    if (activeFilter === 'All') {
      return locations;
    }

    return locations.filter((location) =>
      location.tags.includes(activeFilter),
    );
  }, [activeFilter]);

  return (
    <Layout>
      <Head>
        <title>{messages.exploreList.pageTitle}</title>

        <meta
          name="description"
          content={messages.exploreList.pageDescription}
        />

        <link rel="canonical" href="https://madeiralivecams.com/cameras" />
      </Head>

      <main className="page-shell">
        <section className="max-w-3xl">
          <p className="text-sm font-medium text-ocean">
            {messages.exploreList.eyebrow}
          </p>

          <h1 className="mt-1 text-2xl font-semibold text-navy sm:text-3xl">
            {messages.exploreList.title}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            {messages.exploreList.intro}
          </p>
        </section>

        <section
          className="mt-6"
          aria-label={messages.exploreList.filterAriaLabel}
        >
          <p className="text-sm font-semibold text-navy">
            {messages.exploreList.browseByInterest}
          </p>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'border-ocean bg-ocean text-white'
                      : 'border-slate-200 bg-white text-navy hover:border-ocean hover:text-ocean'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {messages.exploreList.showing} {filteredLocations.length}{' '}
            {messages.exploreList.of} {locations.length}{' '}
            {messages.exploreList.places}
          </p>
        </section>

        <section
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label={messages.exploreList.locationsAriaLabel}
        >
          {filteredLocations.map((location) => {
            const displayLocation = getLocalizedLocation(location, locale);

            return (
              <Link
                key={displayLocation.slug}
                href={`/explore/${displayLocation.slug}`}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-leaf hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ocean">
                    {displayLocation.category}
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-navy">
                    {displayLocation.name}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {displayLocation.area}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {displayLocation.summary}
                  </p>

                  <span className="mt-4 inline-block text-sm font-semibold text-ocean group-hover:underline">
                    {messages.exploreList.readGuide}
                  </span>
                </div>

                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-mist sm:h-24 sm:w-24">
                  <Image
                    src={displayLocation.image}
                    alt={displayLocation.imageAlt}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 80px, 96px"
                  />
                </div>
              </Link>
            );
          })}
        </section>
      </main>
    </Layout>
  );
}