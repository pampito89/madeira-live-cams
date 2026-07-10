
export type CameraCategory =
  | 'Mountains'
  | 'Beaches'
  | 'Towns'
  | 'North Coast'
  | 'South Coast'
  | 'East Coast'
  | 'West Coast'
  | 'Sunrise spots';

export type Camera = {
  id: string;
  name: string;
  region: string;
  category: CameraCategory[];
  altitudeMeters?: number;
  latitude: number;
  longitude: number;
  sourceUrl: string;
  youtubeId?: string;
};

export const cameras: Camera[] = [
  {
    id: 'pico-do-arieiro',
    name: 'Pico do Arieiro',
    region: 'Mountains',
    category: ['Mountains', 'Sunrise spots'],
    altitudeMeters: 1818,
    latitude: 32.735,
    longitude: -16.928,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/pico-do-arieiro',
  },
  {
    id: 'machico',
    name: 'Machico',
    region: 'East Coast',
    category: ['Towns', 'East Coast', 'Beaches'],
    latitude: 32.716,
    longitude: -16.768,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/machico',
  },
  {
    id: 'canical',
    name: 'Caniçal',
    region: 'East Coast',
    category: ['Towns', 'East Coast'],
    latitude: 32.738,
    longitude: -16.737,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/canical',
    youtubeId: 'eTzl0qcPTF8',
  },
  {
    id: 'seixal',
    name: 'Seixal',
    region: 'North Coast',
    category: ['Beaches', 'North Coast'],
    latitude: 32.816,
    longitude: -17.107,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/seixal',
    youtubeId: 'WwOuI_G5WUI',
  },
  {
    id: 'porto-moniz',
    name: 'Porto Moniz',
    region: 'North Coast',
    category: ['North Coast'],
    latitude: 32.867,
    longitude: -17.166,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/porto-moniz',
    youtubeId: 'K07hd6RP8cw',
  },
  {
    id: 'funchal-pontinha',
    name: 'Funchal Pontinha',
    region: 'South Coast',
    category: ['Towns', 'South Coast'],
    latitude: 32.648,
    longitude: -16.907,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/funchal-pontinha',
    youtubeId: 'QZeuP3PjPDw',
  },
  {
    id: 'eira-do-serrado',
    name: 'Eira do Serrado',
    region: 'Mountains',
    category: ['Mountains'],
    latitude: 32.713,
    longitude: -16.949,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/eira-do-serrado',
  },
  {
    id: 'ponta-do-sol',
    name: 'Ponta do Sol',
    region: 'South Coast',
    category: ['Beaches', 'South Coast'],
    latitude: 32.683,
    longitude: -17.100,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/ponta-do-sol',
    youtubeId: 'BuL1tgahkXM',
  },
  {
    id: 'achada-do-teixeira',
    name: 'Achada do Teixeira',
    region: 'Mountains',
    category: ['Mountains'],
    latitude: 32.773,
    longitude: -16.930,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/achada-do-teixeira',
  },
  {
    id: 'camara-de-lobos',
    name: 'Câmara de Lobos',
    region: 'South Coast',
    category: ['Towns', 'South Coast'],
    latitude: 32.633,
    longitude: -16.972,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/camara-de-lobos',
    youtubeId: 'dlyn0fJBBWk',
  },
];
