import Head from 'next/head';
import Layout from '../components/Layout';

type Location = {
  name: string;
  area: string;
  category: string;
  description: string;
  mapQuery: string;
};

const locations: Location[] = [
  {
    name: 'Cristo Rei Viewpoint',
    area: 'Garajau, Caniço',
    category: 'Viewpoint',
    description:
      'A clifftop viewpoint above Garajau with wide Atlantic views and the Cristo Rei statue.',
    mapQuery: 'Cristo Rei Viewpoint Garajau Madeira',
  },
  {
    name: 'Monte Palace Tropical Garden',
    area: 'Monte, Funchal',
    category: 'Garden',
    description:
      'A hillside garden above Funchal, known for tropical plants, water features and city views.',
    mapQuery: 'Monte Palace Tropical Garden Madeira',
  },
  {
    name: 'Funchal',
    area: 'South coast',
    category: 'City',
    description:
      'Madeira’s capital, with a harbour, old town, restaurants, museums and coastal promenades.',
    mapQuery: 'Funchal Madeira',
  },
  {
    name: 'Mercado dos Lavradores',
    area: 'Funchal Old Town',
    category: 'Market',
    description:
      'Funchal’s traditional market for fruit, flowers, local produce and fresh fish.',
    mapQuery: 'Mercado dos Lavradores Funchal',
  },
  {
    name: 'Pico do Arieiro',
    area: 'Central mountains',
    category: 'Sunrise & hiking',
    description:
      'A high mountain viewpoint popular for sunrise, cloud inversions and the route towards Pico Ruivo.',
    mapQuery: 'Pico do Arieiro Madeira',
  },
  {
    name: 'Pico Ruivo',
    area: 'Central mountains',
    category: 'Hiking',
    description:
      'Madeira’s highest peak, reached by mountain trails with expansive views in clear weather.',
    mapQuery: 'Pico Ruivo Madeira',
  },
  {
    name: 'Fajã dos Padres',
    area: 'South coast',
    category: 'Coast',
    description:
      'A quiet coastal estate below towering cliffs, reached by cable car or boat.',
    mapQuery: 'Faja dos Padres Madeira',
  },
  {
    name: 'Cabo Girão Skywalk',
    area: 'Câmara de Lobos',
    category: 'Viewpoint',
    description:
      'A glass-floored platform on one of Europe’s highest sea cliffs, overlooking the south coast.',
    mapQuery: 'Cabo Girao Skywalk Madeira',
  },
  {
    name: 'Levada Nova & Levada do Moinho',
    area: 'Ponta do Sol',
    category: 'Levada walk',
    description:
      'A scenic levada walk through valleys, tunnels, waterfalls and cultivated terraces.',
    mapQuery: 'Levada Nova Levada do Moinho Madeira',
  },
  {
    name: 'Calheta Beach',
    area: 'Calheta',
    category: 'Beach',
    description:
      'A sheltered sandy beach with calmer water, cafés and a marina nearby.',
    mapQuery: 'Calheta Beach Madeira',
  },
  {
    name: 'Vereda da Ponta de São Lourenço',
    area: 'East peninsula',
    category: 'Hiking',
    description:
      'A coastal trail across Madeira’s dry eastern peninsula with dramatic cliffs and ocean views.',
    mapQuery: 'Ponta de Sao Lourenco Trail Madeira',
  },
  {
    name: 'Prainha do Caniçal',
    area: 'Caniçal',
    category: 'Beach',
    description:
      'A small natural beach on Madeira’s east coast, close to the São Lourenço peninsula.',
    mapQuery: 'Prainha do Canical Madeira',
  },
  {
    name: 'Fanal Forest',
    area: 'Paul da Serra',
    category: 'Nature',
    description:
      'An ancient laurel forest known for its twisted trees, mist and atmospheric walks.',
    mapQuery: 'Fanal Forest Madeira',
  },
  {
    name: 'Praia do Porto do Seixal',
    area: 'Seixal',
    category: 'Beach',
    description:
      'A striking black-sand beach on the north coast, surrounded by green mountains and waterfalls.',
    mapQuery: 'Praia do Porto do Seixal Madeira',
  },
  {
    name: 'Porto Moniz Natural Swimming Pools',
    area: 'Porto Moniz',
    category: 'Natural pools',
    description:
      'Volcanic rock pools continuously refreshed by Atlantic seawater on Madeira’s north-west coast.',
    mapQuery: 'Porto Moniz Natural Swimming Pools Madeira',
  },
];

function mapUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

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
            Use this guide to find viewpoints, mountain hikes, levada walks,
            beaches, gardens and coastal places across Madeira.
          </p>
        </section>

        <section
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Madeira locations"
        >
          {locations.map((location) => (
            <article
              key={location.name}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-ocean">
                {location.category}
              </p>

              <h2 className="mt-2 text-lg font-semibold text-navy">
                {location.name}
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                {location.area}
              </p>

              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                {location.description}
              </p>

              <a
                href={mapUrl(location.mapQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#4A939C] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#34737B]"
              >
                Open in Google Maps
              </a>
            </article>
          ))}
        </section>
      </main>
    </Layout>
  );
}