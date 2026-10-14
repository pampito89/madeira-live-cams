import type { Locale } from './config';

type HomePageText = {
  title: string;
  description: string;
  heading: string;
  airportCta: string;
  showing: (visible: number, total: number) => string;
  filtersLabel: string;
  all: string;
  filters: Record<string, string>;
};

export const homePageText: Record<Locale, HomePageText> = {
  en: {
    title: 'Madeira Live Webcams, Weather & Trip Planning | Madeira Live Cams',
    description: 'Watch Madeira live webcams, including the FNC airport camera, compare mountain and coastal conditions, and plan your day around the island.',
    heading: 'Madeira live webcams', airportCta: 'FNC webcam, arrivals and departures',
    showing: (visible, total) => `Showing ${visible} of ${total} cameras`, filtersLabel: 'Camera filters', all: 'All',
    filters: { Mountains: 'Mountains', Beaches: 'Beaches', Towns: 'Towns', 'North Coast': 'North', 'South Coast': 'South', 'East Coast': 'East', 'Sunrise spots': 'Sunrise' },
  },
  pt: {
    title: 'Webcams em direto, meteorologia e viagem na Madeira | Madeira Live Cams',
    description: 'Veja webcams em direto na Madeira, incluindo o aeroporto FNC, compare as condições na montanha e na costa e planeie o seu dia.',
    heading: 'Webcams em direto na Madeira', airportCta: 'Webcam FNC, chegadas e partidas',
    showing: (visible, total) => `A mostrar ${visible} de ${total} câmaras`, filtersLabel: 'Filtros de câmaras', all: 'Todas',
    filters: { Mountains: 'Montanhas', Beaches: 'Praias', Towns: 'Localidades', 'North Coast': 'Norte', 'South Coast': 'Sul', 'East Coast': 'Este', 'Sunrise spots': 'Nascer do sol' },
  },
  de: {
    title: 'Madeira Live-Webcams, Wetter & Reiseplanung | Madeira Live Cams',
    description: 'Sehen Sie Live-Webcams auf Madeira, einschließlich Flughafen FNC, und vergleichen Sie Bedingungen in Bergen und an der Küste.',
    heading: 'Live-Webcams auf Madeira', airportCta: 'FNC-Webcam, Ankünfte und Abflüge',
    showing: (visible, total) => `${visible} von ${total} Kameras angezeigt`, filtersLabel: 'Kamerafilter', all: 'Alle',
    filters: { Mountains: 'Berge', Beaches: 'Strände', Towns: 'Orte', 'North Coast': 'Norden', 'South Coast': 'Süden', 'East Coast': 'Osten', 'Sunrise spots': 'Sonnenaufgang' },
  },
  fr: {
    title: 'Webcams en direct, météo et voyage à Madère | Madeira Live Cams',
    description: 'Regardez les webcams de Madère, dont celle de l’aéroport FNC, comparez les conditions en montagne et sur la côte et planifiez votre journée.',
    heading: 'Webcams en direct à Madère', airportCta: 'Webcam FNC, arrivées et départs',
    showing: (visible, total) => `${visible} caméras affichées sur ${total}`, filtersLabel: 'Filtres des caméras', all: 'Toutes',
    filters: { Mountains: 'Montagnes', Beaches: 'Plages', Towns: 'Villes', 'North Coast': 'Nord', 'South Coast': 'Sud', 'East Coast': 'Est', 'Sunrise spots': 'Lever du soleil' },
  },
  es: {
    title: 'Webcams en directo, tiempo y viaje en Madeira | Madeira Live Cams',
    description: 'Mira webcams en directo de Madeira, incluida la del aeropuerto FNC, compara las condiciones en montaña y costa y planifica tu día.',
    heading: 'Webcams en directo de Madeira', airportCta: 'Webcam FNC, llegadas y salidas',
    showing: (visible, total) => `Mostrando ${visible} de ${total} cámaras`, filtersLabel: 'Filtros de cámaras', all: 'Todas',
    filters: { Mountains: 'Montañas', Beaches: 'Playas', Towns: 'Localidades', 'North Coast': 'Norte', 'South Coast': 'Sur', 'East Coast': 'Este', 'Sunrise spots': 'Amanecer' },
  },
  pl: {
    title: 'Kamery na żywo, pogoda i planowanie podróży na Maderze | Madeira Live Cams',
    description: 'Oglądaj kamery na żywo na Maderze, w tym lotnisko FNC, porównuj warunki w górach i na wybrzeżu oraz planuj dzień.',
    heading: 'Kamery na żywo na Maderze', airportCta: 'Kamera FNC, przyloty i odloty',
    showing: (visible, total) => `Wyświetlono ${visible} z ${total} kamer`, filtersLabel: 'Filtry kamer', all: 'Wszystkie',
    filters: { Mountains: 'Góry', Beaches: 'Plaże', Towns: 'Miejscowości', 'North Coast': 'Północ', 'South Coast': 'Południe', 'East Coast': 'Wschód', 'Sunrise spots': 'Wschód słońca' },
  },
  uk: {
    title: 'Вебкамери Мадейри наживо, погода та план подорожі | Madeira Live Cams',
    description: 'Переглядайте вебкамери Мадейри, включно з камерою аеропорту FNC, порівнюйте умови в горах і на узбережжі та плануйте день.',
    heading: 'Вебкамери Мадейри наживо', airportCta: 'Камера, прибуття та вильоти FNC',
    showing: (visible, total) => `Показано ${visible} з ${total} камер`, filtersLabel: 'Фільтри камер', all: 'Усі',
    filters: { Mountains: 'Гори', Beaches: 'Пляжі', Towns: 'Міста', 'North Coast': 'Північ', 'South Coast': 'Південь', 'East Coast': 'Схід', 'Sunrise spots': 'Схід сонця' },
  },
};
