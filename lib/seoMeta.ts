import type { Locale } from './i18n/config';

export type SeoDescriptionKind = 'camera' | 'explore' | 'stay' | 'restaurant' | 'activity' | 'generic';

const MAX_TITLE_LENGTH = 60;
const MIN_DESCRIPTION_LENGTH = 115;
const MAX_DESCRIPTION_LENGTH = 158;

const MADEIRA_PATTERN = /madeira|madère|madera|мадейр/i;

const fullSuffix: Record<SeoDescriptionKind, Record<Locale, string>> = {
  camera: {
    en: 'Check live visibility, altitude, and Madeira weather conditions.',
    pt: 'Verifique a visibilidade em direto, altitude e o tempo na Madeira.',
    de: 'Prüfen Sie Live-Sicht, Höhe und aktuelle Wetterbedingungen auf Madeira.',
    fr: 'Vérifiez la visibilité en direct, l’altitude et la météo à Madère.',
    es: 'Consulta visibilidad en directo, altitud y el tiempo en Madeira.',
    pl: 'Sprawdź widoczność na żywo, wysokość i pogodę na Maderze.',
    uk: 'Дивіться видимість наживо, висоту та поточну погоду на Мадейрі.',
  },
  explore: {
    en: 'Explore map coordinates, highlights, practical tips, and driving directions on Madeira Live Cams.',
    pt: 'Veja coordenadas no mapa, destaques, dicas práticas e rotas no Madeira Live Cams.',
    de: 'Entdecken Sie Koordinaten, Highlights, praktische Tipps und Routen auf Madeira Live Cams.',
    fr: 'Consultez la carte, les points forts, conseils pratiques et itinéraires sur Madeira Live Cams.',
    es: 'Consulta mapa, puntos clave, consejos prácticos y cómo llegar en Madeira Live Cams.',
    pl: 'Sprawdź mapę, najważniejsze punkty, wskazówki i dojazd na Madeira Live Cams.',
    uk: 'Карта, координати, головні враження, практичні поради та маршрути на Madeira Live Cams.',
  },
  stay: {
    en: 'View exact coordinates, Google Maps and Waze directions, and day-trip planning details on Madeira Live Cams.',
    pt: 'Veja coordenadas exatas, direções no Google Maps e Waze e dados para planear passeios na Madeira.',
    de: 'Sehen Sie exakte Koordinaten, Google-Maps- und Waze-Routen sowie Hinweise für Tagesausflüge auf Madeira.',
    fr: 'Consultez les coordonnées exactes, itinéraires Google Maps et Waze et infos pour vos sorties à Madère.',
    es: 'Consulta coordenadas exactas, rutas en Google Maps y Waze y datos para planificar excursiones en Madeira.',
    pl: 'Sprawdź dokładne współrzędne, dojazd w Google Maps i Waze oraz informacje do planowania wycieczek na Maderze.',
    uk: 'Точні координати, маршрути в Google Maps і Waze та зручна точка для планування поїздок Мадейрою.',
  },
  restaurant: {
    en: 'See Google Maps ratings, visitor summary, and directions on Madeira Live Cams.',
    pt: 'Veja avaliações no Google Maps, resumo de visitantes e direções no Madeira Live Cams.',
    de: 'Sehen Sie Google-Maps-Bewertungen, Besucherfazit und Anfahrt auf Madeira Live Cams.',
    fr: 'Consultez les avis Google Maps, le résumé des visiteurs et l’itinéraire sur Madeira Live Cams.',
    es: 'Consulta valoraciones de Google Maps, resumen de visitantes y cómo llegar en Madeira Live Cams.',
    pl: 'Sprawdź oceny w Google Maps, podsumowanie opinii i dojazd na Madeira Live Cams.',
    uk: 'Рейтинг у Google Maps, підсумок відгуків і маршрут проїзду на Madeira Live Cams.',
  },
  activity: {
    en: 'See Google Maps reviews, practical visitor tips, booking link, and directions on Madeira Live Cams.',
    pt: 'Veja avaliações no Google Maps, dicas práticas, link oficial e direções no Madeira Live Cams.',
    de: 'Sehen Sie Google-Maps-Bewertungen, praktische Tipps, Buchungslink und Anfahrt auf Madeira Live Cams.',
    fr: 'Consultez les avis Google Maps, conseils pratiques, lien officiel et itinéraire sur Madeira Live Cams.',
    es: 'Consulta reseñas en Google Maps, consejos prácticos, enlace oficial y cómo llegar en Madeira Live Cams.',
    pl: 'Sprawdź opinie Google Maps, praktyczne wskazówki, link do rezerwacji i dojazd na Madeira Live Cams.',
    uk: 'Відгуки в Google Maps, практичні поради, офіційний сайт і маршрут проїзду на Madeira Live Cams.',
  },
  generic: {
    en: 'Plan your Madeira trip with live webcams, sunrise weather forecasts, trail availability, and local guides.',
    pt: 'Planeie a sua viagem à Madeira com webcams em direto, previsão do tempo, trilhos e guias locais.',
    de: 'Planen Sie Ihre Madeira-Reise mit Live-Webcams, Sonnenaufgangswetter, Wanderwegen und lokalen Tipps.',
    fr: 'Préparez votre voyage à Madère avec webcams en direct, météo, sentiers et guides locaux.',
    es: 'Planifica tu viaje a Madeira con webcams en directo, previsión del tiempo, senderos y guías locales.',
    pl: 'Zaplanuj podróż na Maderę z kamerami na żywo, prognozą pogody, dostępnością szlaków i przewodnikami.',
    uk: 'Плануйте подорож Мадейрою з онлайн-камерами, прогнозом погоди, статусом маршрутів і локальними гідами.',
  },
};

const shortSuffix: Record<SeoDescriptionKind, Record<Locale, string>> = {
  camera: {
    en: 'Check live Madeira weather and visibility.',
    pt: 'Veja o tempo e a visibilidade na Madeira.',
    de: 'Aktuelles Wetter und Sicht auf Madeira prüfen.',
    fr: 'Vérifiez la météo et la visibilité à Madère.',
    es: 'Consulta el tiempo y visibilidad en Madeira.',
    pl: 'Sprawdź pogodę i widoczność na Maderze.',
    uk: 'Перевірте погоду й видимість на Мадейрі.',
  },
  explore: {
    en: 'Map, visitor tips, and routes on Madeira Live Cams.',
    pt: 'Mapa, dicas e rotas no Madeira Live Cams.',
    de: 'Karte, Tipps und Routen auf Madeira Live Cams.',
    fr: 'Carte, conseils et itinéraires sur Madeira Live Cams.',
    es: 'Mapa, consejos y rutas en Madeira Live Cams.',
    pl: 'Mapa, wskazówki i dojazd na Madeira Live Cams.',
    uk: 'Карта, поради й маршрути на Madeira Live Cams.',
  },
  stay: {
    en: 'Map coordinates and routes on Madeira Live Cams.',
    pt: 'Coordenadas e rotas no Madeira Live Cams.',
    de: 'Koordinaten und Routen auf Madeira Live Cams.',
    fr: 'Coordonnées et itinéraires sur Madeira Live Cams.',
    es: 'Coordenadas y rutas en Madeira Live Cams.',
    pl: 'Współrzędne i dojazd na Madeira Live Cams.',
    uk: 'Координати й маршрути на Madeira Live Cams.',
  },
  restaurant: {
    en: 'Ratings, map, and tips on Madeira Live Cams.',
    pt: 'Avaliações, mapa e dicas no Madeira Live Cams.',
    de: 'Bewertungen, Karte und Tipps auf Madeira Live Cams.',
    fr: 'Avis, carte et conseils sur Madeira Live Cams.',
    es: 'Reseñas, mapa y consejos en Madeira Live Cams.',
    pl: 'Opinie, mapa i wskazówki na Madeira Live Cams.',
    uk: 'Відгуки, карта й поради на Madeira Live Cams.',
  },
  activity: {
    en: 'Reviews, tips, and directions on Madeira Live Cams.',
    pt: 'Avaliações, dicas e rotas no Madeira Live Cams.',
    de: 'Bewertungen, Tipps und Anfahrt auf Madeira Live Cams.',
    fr: 'Avis, conseils et itinéraire sur Madeira Live Cams.',
    es: 'Reseñas, consejos y ruta en Madeira Live Cams.',
    pl: 'Opinie, wskazówki i dojazd na Madeira Live Cams.',
    uk: 'Відгуки, поради й маршрут на Madeira Live Cams.',
  },
  generic: {
    en: 'Live webcams, weather, and guides for Madeira.',
    pt: 'Webcams em direto, tempo e guias da Madeira.',
    de: 'Live-Webcams, Wetter und Tipps für Madeira.',
    fr: 'Webcams en direct, météo et guides à Madère.',
    es: 'Webcams en directo, tiempo y guías de Madeira.',
    pl: 'Kamery na żywo, pogoda i przewodniki po Maderze.',
    uk: 'Онлайн-камери, погода й путівник Мадейрою.',
  },
};

function trimAtWordBoundary(text: string, maxLength: number, addEllipsis = true): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const budget = addEllipsis ? maxLength - 1 : maxLength;
  const slice = clean.slice(0, budget + 1);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace >= Math.floor(budget * 0.6) ? slice.slice(0, lastSpace) : clean.slice(0, budget);
  const trimmed = cut.replace(/[\s,;:–—-]+$/g, '');
  if (!addEllipsis) return trimmed;
  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}…`;
}

export function fitSeoTitle(rawTitle: string, maxLength = MAX_TITLE_LENGTH): string {
  const clean = rawTitle.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;

  const pipeIndex = clean.indexOf(' | ');
  if (pipeIndex > 0) {
    const primary = clean.slice(0, pipeIndex).trim();
    if (!MADEIRA_PATTERN.test(primary)) {
      const withMadeira = `${primary} | Madeira`;
      if (withMadeira.length <= maxLength) return withMadeira;
    }
    if (primary.length <= maxLength) return primary;

    const dashIndex = primary.indexOf(' — ');
    if (dashIndex >= 16) {
      const shorter = primary.slice(0, dashIndex).trim();
      if (!MADEIRA_PATTERN.test(shorter)) {
        const withMadeira = `${shorter} | Madeira`;
        if (withMadeira.length <= maxLength) return withMadeira;
      }
      if (shorter.length <= maxLength) return shorter;
    }
    return trimAtWordBoundary(primary, maxLength, false);
  }

  return trimAtWordBoundary(clean, maxLength, false);
}

export function fitSeoDescription(
  rawDescription: string,
  locale: Locale,
  kind: SeoDescriptionKind = 'generic',
): string {
  const clean = rawDescription.replace(/\s+/g, ' ').trim();
  if (!clean) return fullSuffix[kind][locale];

  let result = clean;
  if (result.length < MIN_DESCRIPTION_LENGTH) {
    const base = /[.!?…]$/.test(result) ? result : `${result}.`;
    const candidateFull = `${base} ${fullSuffix[kind][locale]}`;
    if (candidateFull.length <= MAX_DESCRIPTION_LENGTH) {
      return candidateFull;
    }
    const candidateShort = `${base} ${shortSuffix[kind][locale]}`;
    if (candidateShort.length <= MAX_DESCRIPTION_LENGTH && candidateShort.length >= MIN_DESCRIPTION_LENGTH) {
      return candidateShort;
    }
    if (candidateFull.length > MAX_DESCRIPTION_LENGTH) {
      return trimAtWordBoundary(candidateFull, MAX_DESCRIPTION_LENGTH, true);
    }
    return candidateShort;
  }

  if (result.length > MAX_DESCRIPTION_LENGTH) {
    const windowText = result.slice(0, MAX_DESCRIPTION_LENGTH);
    const sentenceEnd = Math.max(windowText.lastIndexOf('. '), windowText.lastIndexOf('! '), windowText.lastIndexOf('? '));
    if (sentenceEnd >= MIN_DESCRIPTION_LENGTH - 1) {
      return windowText.slice(0, sentenceEnd + 1).trim();
    }
    return trimAtWordBoundary(result, MAX_DESCRIPTION_LENGTH, true);
  }

  return result;
}
