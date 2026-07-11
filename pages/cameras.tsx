import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../components/Layout';
import { locations } from '../data/locations';

export default function CamerasPage() {
  return (
    <Layout>
      <Head>
        <title>Explore Madeira | Viewpoints, Hikes, Beaches & Places</title>

        <meta
          name="description"
          content="Explore Madeira’s best viewpoints, hiking trails, beaches, gardens and places to visit, from Pico do Arieiro to Porto Moniz."
        />

        <link rel="canonical" href="https://madeiralivecams.com/cameras" />
      </Head>

      <main className="page-shell">
        <section className="mb-8 max-w-3xl">
          <p className="text-sm font-medium text-ocean">Explore Madeira</p>

          <h1 className="mt-1 text-2xl font-semibold text-navy sm:text-3xl">
            Places to explore around Madeira
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Browse viewpoints, mountain hikes, levada walks, beaches, gardens
            and coastal places across Madeira.
          </p>
        </section>

        <section
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Madeira locations"
        >
          {locations.map((location) => (
            <Link
  key={location.slug}
  href={`/explore/${location.slug}`}
  className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-ocean hover:shadow-md"
>
  <div className="min-w-0 flex-1">
    <p className="text-xs font-semibold uppercase tracking-wide text-ocean">
      {location.category}
    </p>

    <h2 className="mt-1 text-lg font-semibold text-navy">
      {location.name}
    </h2>

    <p className="mt-1 text-sm font-medium text-slate-500">
      {location.area}
    </p>

    <p className="mt-3 text-sm leading-6 text-slate-600">
      {location.summary}
    </p>

    <span className="mt-4 inline-block text-sm font-semibold text-ocean group-hover:underline">
      Read the guide →
    </span>
  </div>

  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24">
    <Image
      src={location.image}
      alt={location.imageAlt}
      fill
      className="object-cover transition duration-300 group-hover:scale-105"
      sizes="(max-width: 640px) 80px, 96px"
    />
  </div>
</Link>
          ))}
        </section>
      </main>
    </Layout>
  );
}