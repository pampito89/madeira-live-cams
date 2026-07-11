export type Location = {
  slug: string;
  name: string;
  area: string;
  category: string;
  tags: string[];
  summary: string;
  image: string;
  imageAlt: string;
  mapQuery: string;
  article: {
    intro: string;
    history: string;
    highlights: string[];
    practicalTip: string;
  };
};

export const locations: Location[] = [
  {
    slug: 'cristo-rei',
    name: 'Cristo Rei Viewpoint',
    area: 'Garajau, Caniço',
    category: 'Viewpoint',
    // Cristo Rei
tags: ['Viewpoints'],
    summary:
      'A clifftop viewpoint above Garajau with wide Atlantic views and the Cristo Rei statue.',
    image: '/images/explore/cristo-rei.jpg',
    imageAlt: 'Cristo Rei viewpoint in Garajau, Madeira',
    mapQuery: 'Cristo Rei Viewpoint Garajau Madeira',
    article: {
      intro:
        'Cristo Rei is a peaceful coastal viewpoint in Garajau, on the south-east side of Madeira. It looks across the Atlantic and towards the Garajau nature reserve.',
      history:
        'The viewpoint is known for its Christ the King statue and has become a popular stop for visitors exploring Caniço and the eastern coast.',
      highlights: [
        'Open Atlantic views from high coastal cliffs',
        'The Cristo Rei statue and nearby Garajau coastline',
        'A useful stop when travelling between Funchal and the airport',
      ],
      practicalTip:
        'Visit in the morning or late afternoon for softer light, and combine it with a walk or swim around Garajau.',
    },
  },
  {
  slug: 'monte-palace-tropical-garden',
  name: 'Monte Palace Tropical Garden',
  area: 'Monte, Funchal',
  category: 'Garden & culture',
  tags: ['City & culture'],
  summary:
    'A hillside garden above Funchal where tropical plants, water features, Portuguese tiles and art collections meet.',
  image: '/images/explore/monte-palace-tropical-garden.jpg',
  imageAlt:
    'Tropical garden, lake and lush plants at Monte Palace in Madeira',
  mapQuery: 'Monte Palace Tropical Garden Madeira',
  article: {
    intro:
      'Monte Palace Tropical Garden is one of Madeira’s best-known botanical and cultural attractions. Set high above Funchal in Monte, the 70,000-square-metre garden brings together exotic plants, lakes, historic Portuguese tiles, Asian-inspired design and museum collections.',
    history:
      'The site began in the 18th century, when British consul Charles Murray created the Quinta do Prazer estate south of Monte Church. In 1897, Alfredo Guilherme Rodrigues acquired the property and built a palace-like residence inspired by the castles he had seen along Germany’s Rhine. It later became the Monte Palace Hotel, but after closing it fell into decline. In 1987, Madeiran businessman, art collector and philanthropist José Manuel Rodrigues Berardo acquired the former hotel and transformed the estate into the garden visitors see today.',
    highlights: [
      'Around 100,000 plant specimens from Madeira and several continents',
      'Ponds, waterfalls, koi carp, swans, ducks and free-roaming peacocks',
      'Portuguese azulejo tiles dating from the 15th to the 20th centuries',
      'The 166-tile panel The Adventures of the Portuguese in Japan',
      'Japanese- and Chinese-inspired details, including lanterns, bridges and Buddhist statues',
      'A three-floor museum with minerals, semi-precious stones and contemporary Zimbabwean stone sculpture',
      'Views across Funchal Bay and the Atlantic from the hillside paths',
    ],
    practicalTip:
      'Allow at least two to three hours. The garden is steep, with many paths and steps, so wear comfortable shoes. A cable car from Funchal is one of the most scenic ways to reach Monte.',
  },
},
  {
    slug: 'funchal',
    name: 'Funchal',
    area: 'South coast',
    category: 'City',
    // Funchal
tags: ['City & culture'],
    summary:
      'Madeira’s capital, with a harbour, old town, restaurants, museums and coastal promenades.',
    	image: '/images/explore/funchal.jpg',
    imageAlt: 'Funchal harbour and city on Madeira',
    mapQuery: 'Funchal Madeira',
    article: {
      intro:
        'Funchal is Madeira’s capital and the best base for travellers who want restaurants, museums, markets and easy access to the south coast.',
      history:
        'The city grew around its sheltered bay and harbour, becoming Madeira’s main commercial and administrative centre.',
      highlights: [
        'Historic streets in the Old Town',
        'Harbour promenades and views across Funchal Bay',
        'A convenient base for buses, tours and cable cars',
      ],
      practicalTip:
        'Walk the Old Town in the evening, then use the seafront promenade to reach the harbour area.',
    },
  },
  {
    slug: 'mercado-dos-lavradores',
    name: 'Mercado dos Lavradores',
    area: 'Funchal Old Town',
    category: 'Market',
    // Mercado dos Lavradores
tags: ['City & culture'],
    summary:
      'Funchal’s traditional market for fruit, flowers, local produce and fresh fish.',
    image: '/images/explore/mercado-dos-lavradores.jpg',
    imageAlt: 'Mercado dos Lavradores market in Funchal',
    mapQuery: 'Mercado dos Lavradores Funchal',
    article: {
      intro:
        'Mercado dos Lavradores is Funchal’s best-known traditional market, close to the Old Town and waterfront.',
      history:
        'The market has long been a meeting point for local produce, flowers and fish, and remains one of the city’s most recognisable buildings.',
      highlights: [
        'Colourful flower and fruit stalls',
        'Fresh fish market area',
        'Central location near Funchal Old Town',
      ],
      practicalTip:
        'Check prices before buying fruit, especially items sold as samples to visitors.',
    },
  },
  {
    slug: 'pico-do-arieiro',
    name: 'Pico do Arieiro',
    area: 'Central mountains',
    category: 'Sunrise & hiking',
    // Pico do Arieiro
tags: ['Hiking', 'Viewpoints'],
    summary:
      'A high mountain viewpoint popular for sunrise, cloud inversions and the route towards Pico Ruivo.',
    image: '/images/explore/pico-do-arieiro.jpg',
    imageAlt: 'Sunrise above the clouds at Pico do Arieiro, Madeira',
    mapQuery: 'Pico do Arieiro Madeira',
    article: {
      intro:
        'Pico do Arieiro is one of Madeira’s most accessible high-mountain viewpoints. At 1,818 metres, it offers broad views across the central mountain massif when the weather is clear.',
      history:
        'Its high road access and dramatic ridgelines made it a landmark for visitors long before sunrise tourism became popular.',
      highlights: [
        'Sunrise above a sea of clouds on suitable mornings',
        'Views into Madeira’s central mountain massif',
        'The starting point for mountain routes towards Pico Ruivo',
      ],
      practicalTip:
        'Check mountain weather and the live camera before leaving. Bring warm layers and allow extra driving time in cloud or darkness.',
    },
  },
  {
    slug: 'pico-ruivo',
    name: 'Pico Ruivo',
    area: 'Central mountains',
    category: 'Hiking',
    // Pico Ruivo
tags: ['Hiking'],
    summary:
      'Madeira’s highest peak, reached by mountain trails with expansive views in clear weather.',
    image: '/images/explore/pico-ruivo.jpg',
    imageAlt: 'Mountain ridge near Pico Ruivo in Madeira',
    mapQuery: 'Pico Ruivo Madeira',
    article: {
      intro:
        'Pico Ruivo is Madeira’s highest summit and a major goal for hikers visiting the island’s central mountains.',
      history:
        'The peak has long been connected by highland paths, with routes from Achada do Teixeira and the Pico do Arieiro area.',
      highlights: [
        'Madeira’s highest mountain summit',
        'High-altitude walking and ridge scenery',
        'Wide views in stable, clear weather',
      ],
      practicalTip:
        'Always check official trail status and mountain conditions before setting out.',
    },
  },
  {
    slug: 'faja-dos-padres',
    name: 'Fajã dos Padres',
    area: 'South coast',
    category: 'Coast',
// Fajã dos Padres
tags: ['Beaches'],
    summary:
      'A quiet coastal estate below towering cliffs, reached by cable car or boat.',
    image: '/images/explore/faja-dos-padres.jpg',
    imageAlt: 'Fajã dos Padres coast below cliffs in Madeira',
    mapQuery: 'Faja dos Padres Madeira',
    article: {
      intro:
        'Fajã dos Padres is a sheltered strip of coast below Madeira’s high southern cliffs.',
      history:
        'Its unusual location beneath the cliffs supported cultivation and a small coastal settlement over many generations.',
      highlights: [
        'A dramatic cable-car approach beneath cliffs',
        'Quiet coast and cultivated terraces',
        'A slower alternative to the busier south-coast resorts',
      ],
      practicalTip:
        'Check cable-car operating times before travelling, particularly outside the main season.',
    },
  },
  {
    slug: 'cabo-girao-skywalk',
    name: 'Cabo Girão Skywalk',
    area: 'Câmara de Lobos',
    category: 'Viewpoint',
    // Cabo Girão
tags: ['Viewpoints'],
    summary:
      'A glass-floored platform above the south coast with views over cliffs, ocean and farmland.',
    image: '/images/explore/cabo-girao-skywalk.jpg',
    imageAlt: 'Cabo Girao Skywalk above Madeira south coast',
    mapQuery: 'Cabo Girao Skywalk Madeira',
    article: {
      intro:
        'Cabo Girão is a dramatic sea-cliff viewpoint west of Funchal, best known for its glass-floored skywalk.',
      history:
        'The cape became an iconic viewpoint because of its high cliffs and the small cultivated plots far below.',
      highlights: [
        'Glass-floor viewing platform',
        'Panoramas over the south coast and Atlantic',
        'Views of terraced farmland at the foot of the cliffs',
      ],
      practicalTip:
        'Go early or late in the day to avoid the busiest tour-bus period.',
    },
  },
  {
    slug: 'levada-nova-levada-do-moinho',
    name: 'Levada Nova & Levada do Moinho',
    area: 'Ponta do Sol',
    category: 'Levada walk',
    // Levada Nova & Levada do Moinho
tags: ['Levada walks', 'Hiking'],
    summary:
      'A scenic levada walk through valleys, tunnels, waterfalls and cultivated terraces.',
    image: '/images/explore/levada-nova-levada-do-moinho.jpg',
    imageAlt: 'Levada path near Ponta do Sol in Madeira',
    mapQuery: 'Levada Nova Levada do Moinho Madeira',
    article: {
      intro:
        'Levada Nova and Levada do Moinho are popular water-channel paths in the Ponta do Sol area.',
      history:
        'Like many Madeira levadas, these channels were built to carry water to agricultural land and are now used as walking routes.',
      highlights: [
        'Irrigation channels, valleys and terrace landscapes',
        'Waterfalls and short tunnels on parts of the route',
        'A classic example of Madeira’s levada network',
      ],
      practicalTip:
        'Use a torch for tunnels and wear shoes with good grip after rain.',
    },
  },
  {
    slug: 'calheta-beach',
    name: 'Calheta Beach',
    area: 'Calheta',
    category: 'Beach',
    // Calheta Beach
tags: ['Beaches'],
    summary:
      'A sheltered sandy beach with calmer water, cafés and a marina nearby.',
    image: '/images/explore/calheta-beach.jpg',
    imageAlt: 'Calheta Beach on Madeira south-west coast',
    mapQuery: 'Calheta Beach Madeira',
    article: {
      intro:
        'Calheta Beach is a sheltered south-west coast beach with sand, a marina and nearby cafés.',
      history:
        'The beach was created as part of Calheta’s coastal leisure area and is distinct from Madeira’s many pebble and black-sand beaches.',
      highlights: [
        'Sheltered swimming area',
        'Sand beach and family-friendly facilities',
        'Marina, cafés and south-west coast sunshine',
      ],
      practicalTip:
        'It is often calmer than open-ocean beaches, but check local sea conditions before swimming.',
    },
  },
  {
    slug: 'ponta-de-sao-lourenco',
    name: 'Vereda da Ponta de São Lourenço',
    area: 'East peninsula',
    category: 'Hiking',
// Ponta de São Lourenço
tags: ['Hiking'],
    summary:
      'A coastal trail across Madeira’s dry eastern peninsula with dramatic cliffs and ocean views.',
    image: '/images/explore/ponta-de-sao-lourenco.jpg',
    imageAlt: 'Coastal cliffs on Ponta de Sao Lourenco in Madeira',
    mapQuery: 'Ponta de Sao Lourenco Trail Madeira',
    article: {
      intro:
        'Ponta de São Lourenço is Madeira’s eastern peninsula, markedly drier and more open than the island’s green interior.',
      history:
        'Its exposed volcanic landscape has been shaped by Atlantic wind, salt and limited rainfall.',
      highlights: [
        'Distinct dry coastal scenery',
        'Clifftop paths and views across the Atlantic',
        'A landscape very different from Madeira’s levadas and forests',
      ],
      practicalTip:
        'Bring water, sun protection and wind protection: shade is limited along the trail.',
    },
  },
  {
    slug: 'prainha-do-canical',
    name: 'Prainha do Caniçal',
    area: 'Caniçal',
    category: 'Beach',
    // Prainha do Caniçal
tags: ['Beaches'],
    summary:
      'A small natural beach on Madeira’s east coast, close to the São Lourenço peninsula.',
    image: '/images/explore/prainha-do-canical.jpg',
    imageAlt: 'Prainha beach near Canical in Madeira',
    mapQuery: 'Prainha do Canical Madeira',
    article: {
      intro:
        'Prainha do Caniçal is a small beach on Madeira’s eastern side, near the road to Ponta de São Lourenço.',
      history:
        'Its sheltered bay provides a contrast to the more exposed cliffs and hiking routes nearby.',
      highlights: [
        'A compact natural beach on the east coast',
        'Convenient stop before or after São Lourenço',
        'Clear coastal views in suitable weather',
      ],
      practicalTip:
        'Combine it with the São Lourenço trail, but leave enough time to return before sunset.',
    },
  },
  {
    slug: 'fanal-forest',
    name: 'Fanal Forest',
    area: 'Paul da Serra',
    category: 'Nature',
// Fanal Forest
tags: ['Hiking'],
    summary:
      'An ancient laurel forest known for its twisted trees, mist and atmospheric walks.',
    image: '/images/explore/fanal-forest.jpg',
    imageAlt: 'Ancient laurel trees in mist at Fanal Forest, Madeira',
    mapQuery: 'Fanal Forest Madeira',
    article: {
      intro:
        'Fanal Forest is a high plateau landscape in north-west Madeira, known for old laurel trees that often appear through mist and low cloud.',
      history:
        'The area forms part of Madeira’s Laurissilva landscape, a remnant of ancient subtropical forest that once covered much wider areas of southern Europe.',
      highlights: [
        'Twisted, ancient laurel trees',
        'Frequent mist that creates a distinctive atmosphere',
        'A striking contrast with Madeira’s coast and high ridges',
      ],
      practicalTip:
        'Fog is common and is part of the experience, but drive slowly and bring a waterproof layer.',
    },
  },
  {
    slug: 'praia-do-porto-do-seixal',
    name: 'Praia do Porto do Seixal',
    area: 'Seixal',
    category: 'Beach',
// Praia do Porto do Seixal
tags: ['Beaches'],
    summary:
      'A black-sand beach on the north coast, surrounded by green mountains and waterfalls.',
    image: '/images/explore/praia-do-porto-do-seixal.jpg',
    imageAlt: 'Black sand beach at Seixal on Madeira',
    mapQuery: 'Praia do Porto do Seixal Madeira',
    article: {
      intro:
        'Praia do Porto do Seixal is a scenic north-coast beach framed by steep green mountains.',
      history:
        'The beach is part of Seixal’s volcanic coastline, where dark sand and rocks contrast strongly with the surrounding vegetation.',
      highlights: [
        'Dark volcanic sand and dramatic green surroundings',
        'North-coast scenery and nearby waterfalls',
        'A photogenic stop on a west or north-coast drive',
      ],
      practicalTip:
        'Sea conditions can change quickly on the north coast; follow local guidance before entering the water.',
    },
  },
  {
  slug: 'porto-moniz-natural-pools',
  name: 'Porto Moniz Natural Swimming Pools',
  area: 'Porto Moniz, north-west coast',
  category: 'Natural pools',
  tags: ['Beaches'],
  summary:
    'Volcanic-rock pools on Madeira’s north-west coast, naturally filled and renewed by Atlantic seawater.',
  image: '/images/explore/porto-moniz-pools.jpg',
  imageAlt:
    'Volcanic natural swimming pools beside the Atlantic Ocean in Porto Moniz, Madeira',
  mapQuery: 'Porto Moniz Natural Swimming Pools Madeira',
  article: {
    intro:
      'Porto Moniz is a small town on Madeira’s dramatic north-west coast, where green mountains meet the Atlantic. It is best known for its natural swimming pools: saltwater basins formed among black volcanic lava rock and continually refreshed by the ocean.',
    history:
      'The Porto Moniz area was once known as Ponta do Tristão. Its modern name is linked to Francisco Moniz, an Algarvian nobleman and an early settler who lived near the Chapel of Nossa Senhora da Conceição. For centuries, the area was relatively isolated by Madeira’s rugged geography, and local life centred on farming, livestock, timber and fishing. Today, tourism is an important part of the local economy, but the town remains closely connected to its volcanic coast and rural north-side landscape.',
    highlights: [
      'Natural saltwater basins shaped by volcanic lava rock and Atlantic erosion',
      'Ocean water enters through openings in the rocks, continually renewing the pools',
      'A managed swimming complex with around 3,800 m² of swimming area and a solarium of about 3,210 m²',
      'Children’s pool, changing rooms, bar, first-aid post, parking and accessible entry',
      'A wilder, less-developed lava-pool area near the Fort of São João Baptista',
      'Views of Madeira’s rugged north coast, green mountains and open Atlantic',
    ],
    practicalTip:
      'Arrive early or later in the afternoon to avoid the busiest period. Bring water shoes for volcanic rock, check sea conditions before swimming, and use the managed complex if you prefer supervised facilities.',
  },
},
];

export function getLocationBySlug(slug: string) {
  return locations.find((location) => location.slug === slug);
}