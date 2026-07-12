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
  Mountains: {
    en: 'Mountains',
    uk: 'Гори',
  },
  Beaches: {
    en: 'Beaches',
    uk: 'Пляжі',
  },
  Towns: {
    en: 'Towns',
    uk: 'Міста',
  },
  'North Coast': {
    en: 'North Coast',
    uk: 'Північне узбережжя',
  },
  'South Coast': {
    en: 'South Coast',
    uk: 'Південне узбережжя',
  },
  'East Coast': {
    en: 'East Coast',
    uk: 'Східне узбережжя',
  },
  'West Coast': {
    en: 'West Coast',
    uk: 'Західне узбережжя',
  },
  'Sunrise spots': {
    en: 'Sunrise spots',
    uk: 'Місця для світанку',
  },
};

export function getLocalizedCamera(
  camera: Camera,
  locale: Locale,
): DisplayCamera {
  return {
    id: camera.id,
    name: camera.name[locale],
    region: camera.region[locale],
    category: camera.category.map(
      (category) => categoryLabels[category][locale],
    ),
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
    name: {
      en: 'Pico do Arieiro',
      uk: 'Піку-ду-Аріейру',
    },
    region: {
      en: 'Mountains',
      uk: 'Гори',
    },
    category: ['Mountains', 'Sunrise spots'],
    altitudeMeters: 1818,
    latitude: 32.735,
    longitude: -16.928,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/pico-do-arieiro',
  },
  {
    id: 'machico',
    name: {
      en: 'Machico',
      uk: 'Машіку',
    },
    region: {
      en: 'East Coast',
      uk: 'Східне узбережжя',
    },
    category: ['Towns', 'East Coast', 'Beaches'],
    latitude: 32.716,
    longitude: -16.768,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/machico',
  },
  {
    id: 'canical',
    name: {
      en: 'Caniçal',
      uk: 'Канісал',
    },
    region: {
      en: 'East Coast',
      uk: 'Східне узбережжя',
    },
    category: ['Towns', 'East Coast'],
    latitude: 32.738,
    longitude: -16.737,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/canical',
    youtubeId: 'eTzl0qcPTF8',
  },
  {
    id: 'seixal',
    name: {
      en: 'Seixal',
      uk: 'Сейшал',
    },
    region: {
      en: 'North Coast',
      uk: 'Північне узбережжя',
    },
    category: ['Beaches', 'North Coast'],
    latitude: 32.816,
    longitude: -17.107,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/seixal',
    youtubeId: 'WwOuI_G5WUI',
  },
  {
    id: 'porto-moniz',
    name: {
      en: 'Porto Moniz',
      uk: 'Порту-Моніш',
    },
    region: {
      en: 'North Coast',
      uk: 'Північне узбережжя',
    },
    category: ['North Coast'],
    latitude: 32.867,
    longitude: -17.166,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/porto-moniz',
    youtubeId: 'K07hd6RP8cw',
  },
  {
    id: 'funchal-pontinha',
    name: {
      en: 'Funchal Pontinha',
      uk: 'Фуншал — Понтінья',
    },
    region: {
      en: 'South Coast',
      uk: 'Південне узбережжя',
    },
    category: ['Towns', 'South Coast'],
    latitude: 32.648,
    longitude: -16.907,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/funchal-pontinha',
    youtubeId: 'QZeuP3PjPDw',
  },
  {
    id: 'eira-do-serrado',
    name: {
      en: 'Eira do Serrado',
      uk: 'Ейра-ду-Серраду',
    },
    region: {
      en: 'Mountains',
      uk: 'Гори',
    },
    category: ['Mountains'],
    latitude: 32.713,
    longitude: -16.949,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/eira-do-serrado',
  },
  {
    id: 'ponta-do-sol',
    name: {
      en: 'Ponta do Sol',
      uk: 'Понта-ду-Сол',
    },
    region: {
      en: 'South Coast',
      uk: 'Південне узбережжя',
    },
    category: ['Beaches', 'South Coast'],
    latitude: 32.683,
    longitude: -17.1,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/ponta-do-sol',
    youtubeId: 'BuL1tgahkXM',
  },
  {
    id: 'achada-do-teixeira',
    name: {
      en: 'Achada do Teixeira',
      uk: 'Ашада-ду-Тейшейра',
    },
    region: {
      en: 'Mountains',
      uk: 'Гори',
    },
    category: ['Mountains'],
    latitude: 32.773,
    longitude: -16.93,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/achada-do-teixeira',
  },
  {
    id: 'camara-de-lobos',
    name: {
      en: 'Câmara de Lobos',
      uk: 'Камара-де-Лобуш',
    },
    region: {
      en: 'South Coast',
      uk: 'Південне узбережжя',
    },
    category: ['Towns', 'South Coast'],
    latitude: 32.633,
    longitude: -16.972,
    sourceUrl: 'https://www.netmadeira.com/webcams-madeira/camara-de-lobos',
    youtubeId: 'dlyn0fJBBWk',
  },
];