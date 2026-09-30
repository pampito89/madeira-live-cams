export type Locale = 'en' | 'uk';

export type LocalizedText = {
  en: string;
  uk: string;
};

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
  name: LocalizedText;
  region: LocalizedText;
  category: CameraCategory[];
  altitudeMeters?: number;
  latitude: number;
  longitude: number;
  sourceUrl: string;
  youtubeId?: string;
};

export type DisplayCamera = {
  id: string;
  name: string;
  region: string;
  category: string[];
  altitudeMeters?: number;
  latitude: number;
  longitude: number;
  sourceUrl: string;
  youtubeId?: string;
};

const categoryLabels: Record<CameraCategory, LocalizedText> = {
  Mountains: { en: 'Mountains', uk: 'Гори' },
  Beaches: { en: 'Beaches', uk: 'Пляжі' },
  Towns: { en: 'Towns', uk: 'Міста' },
  'North Coast': { en: 'North', uk: 'Північ' },
  'South Coast': { en: 'South', uk: 'Південь' },
  'East Coast': { en: 'East', uk: 'Схід' },
  'West Coast': { en: 'West', uk: 'Захід' },
  'Sunrise spots': { en: 'Sunrise', uk: 'Схід сонця' },
};

export function getLocalizedCamera(
  camera: Camera,
  locale: Locale
): DisplayCamera {
  return {
    id: camera.id,
    name: camera.name[locale],
    region: camera.region[locale],
    category: camera.category.map((category) => categoryLabels[category][locale]),
    altitudeMeters: camera.altitudeMeters,
    latitude: camera.latitude,
    longitude: camera.longitude,
    sourceUrl: camera.sourceUrl,
    youtubeId: camera.youtubeId,
  };
}

export const cameras: Camera[] = [
  {
    id: 'pico-do-arieiro',
    name: { en: 'Pico do Arieiro', uk: 'Піку-ду-Аріейру' },
    region: { en: 'Mountains', uk: 'Гори' },
    category: ['Mountains', 'Sunrise spots'],
    altitudeMeters: 1818,
    latitude: 32.735,
    longitude: -16.928,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/pico-do-arieiro',
  },
  {
    id: 'machico',
    name: { en: 'Machico', uk: 'Машіку' },
    region: { en: 'East Coast', uk: 'Східне узбережжя' },
    category: ['Towns', 'East Coast', 'Beaches'],
    latitude: 32.716,
    longitude: -16.768,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/machico',
  },
  {
    id: 'canical',
    name: { en: 'Caniçal', uk: 'Канісал' },
    region: { en: 'East Coast', uk: 'Східне узбережжя' },
    category: ['Towns', 'East Coast'],
    latitude: 32.738,
    longitude: -16.737,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/canical',
    youtubeId: 'H4ODWatYyb8',
  },
  {
    id: 'seixal',
    name: { en: 'Seixal', uk: 'Сейшал' },
    region: { en: 'North Coast', uk: 'Північне узбережжя' },
    category: ['Beaches', 'North Coast'],
    latitude: 32.816,
    longitude: -17.107,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/seixal',
    youtubeId: 'WwOuI_G5WUI',
  },
  {
    id: 'porto-moniz',
    name: { en: 'Porto Moniz', uk: 'Порту-Моніш' },
    region: { en: 'North Coast', uk: 'Північне узбережжя' },
    category: ['Beaches', 'North Coast'],
    latitude: 32.867,
    longitude: -17.166,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/porto-moniz',
    youtubeId: 'QcMxxAIo8CI',
  },
  {
    id: 'funchal-pontinha',
    name: { en: 'Funchal Pontinha', uk: 'Фуншал — Понтінья' },
    region: { en: 'South Coast', uk: 'Південне узбережжя' },
    category: ['Towns', 'South Coast'],
    latitude: 32.648,
    longitude: -16.907,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/funchal-pontinha',
    youtubeId: 'QZeuP3PjPDw',
  },
  {
    id: 'eira-do-serrado',
    name: { en: 'Eira do Serrado', uk: 'Ейра-ду-Серраду' },
    region: { en: 'Mountains', uk: 'Гори' },
    category: ['Mountains'],
    latitude: 32.713,
    longitude: -16.949,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/eira-do-serrado',
  },
  {
    id: 'ponta-do-sol',
    name: { en: 'Ponta do Sol', uk: 'Понта-ду-Сол' },
    region: { en: 'South Coast', uk: 'Південне узбережжя' },
    category: ['Beaches', 'South Coast'],
    latitude: 32.683,
    longitude: -17.1,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/ponta-do-sol',
    youtubeId: 'BuL1tgahkXM',
  },
  {
    id: 'calheta-beach',
    name: { en: 'Calheta Beach', uk: 'Пляж Кальєта' },
    region: { en: 'South Coast', uk: 'Південне узбережжя' },
    category: ['Beaches', 'South Coast'],
    latitude: 32.7189,
    longitude: -17.1744,
    sourceUrl: 'https://www.youtube.com/watch?v=t4x0u0ARLwo',
    youtubeId: 't4x0u0ARLwo',
  },
  {
    id: 'doca-do-cavacas',
    name: { en: 'Doca do Cavacas Pools', uk: 'Басейни Дока-ду-Кавакаш' },
    region: { en: 'South Coast', uk: 'Південне узбережжя' },
    category: ['Beaches', 'Towns', 'South Coast'],
    latitude: 32.6353,
    longitude: -16.9481,
    sourceUrl: 'https://www.youtube.com/watch?v=8ZmLLUPqlPM',
    youtubeId: '8ZmLLUPqlPM',
  },
  {
    id: 'achada-do-teixeira',
    name: { en: 'Achada do Teixeira', uk: 'Ашада-ду-Тейшейра' },
    region: { en: 'Mountains', uk: 'Гори' },
    category: ['Mountains'],
    latitude: 32.773,
    longitude: -16.93,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/achada-do-teixeira',
  },
  {
    id: 'camara-de-lobos',
    name: { en: 'Câmara de Lobos', uk: 'Камара-де-Лобуш' },
    region: { en: 'South Coast', uk: 'Південне узбережжя' },
    category: ['Towns', 'South Coast'],
    latitude: 32.633,
    longitude: -16.972,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/camara-de-lobos',
    youtubeId: 'fnAFU7au4VQ',
  },
  {
    id: 'ponta-delgada',
    name: { en: 'Ponta Delgada', uk: 'Понта-Делгада' },
    region: { en: 'North Coast', uk: 'Північне узбережжя' },
    category: ['Towns', 'North Coast'],
    latitude: 32.828,
    longitude: -16.987,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/ponta-delgada',
  },
  {
    id: 'seixal-beach',
    name: { en: 'Seixal Beach', uk: 'Пляж Сейшал' },
    region: { en: 'North Coast', uk: 'Північне узбережжя' },
    category: ['Beaches', 'North Coast'],
    latitude: 32.821,
    longitude: -17.107,
    sourceUrl: 'https://www.youtube.com/watch?v=a9DiMHIpnWA',
    youtubeId: 'a9DiMHIpnWA',
  },
  {
    id: 'machico-beach',
    name: { en: 'Machico Beach', uk: 'Пляж Машіку' },
    region: { en: 'East Coast', uk: 'Східне узбережжя' },
    category: ['Beaches', 'East Coast'],
    latitude: 32.7224,
    longitude: -16.7648,
    sourceUrl: 'https://www.youtube.com/watch?v=MhOuCDXuP_0',
    youtubeId: 'MhOuCDXuP_0',
  },
  {
    id: 'santo-da-serra-golf',
    name: {
      en: 'Santo da Serra Golf Club',
      uk: 'Гольф-клуб Санту-да-Серра',
    },
    region: { en: 'East Coast', uk: 'Східне узбережжя' },
    category: ['Mountains', 'East Coast'],
    latitude: 32.7222,
    longitude: -16.8039,
    sourceUrl: 'https://www.youtube.com/watch?v=xiQC5Qbi3qE',
    youtubeId: 'xiQC5Qbi3qE',
  },
  {
    id: 'boaventura',
    name: { en: 'Boaventura', uk: 'Боавентура' },
    region: { en: 'North Coast', uk: 'Північне узбережжя' },
    category: ['Towns', 'Mountains', 'North Coast'],
    latitude: 32.7919,
    longitude: -16.9731,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/boaventura',
  },
];