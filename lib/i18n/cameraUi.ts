import type { Locale } from './config';

const previewLabels: Record<Locale, string> = {
  en: 'Latest live preview', pt: 'Pré-visualização mais recente', de: 'Neueste Live-Vorschau',
  fr: 'Dernier aperçu en direct', es: 'Última vista en directo', pl: 'Najnowszy podgląd na żywo', uk: 'Останній кадр трансляції',
};

const labelMaps: Record<Locale, Record<string, string>> = {
  en: {},
  pt: { Mountains: 'Montanhas', Beaches: 'Praias', Towns: 'Localidades', 'North Coast': 'Costa norte', 'South Coast': 'Costa sul', 'East Coast': 'Costa leste', 'Sunrise spots': 'Locais para o nascer do sol', 'Central Mountains': 'Montanhas centrais' },
  de: { Mountains: 'Berge', Beaches: 'Strände', Towns: 'Orte', 'North Coast': 'Nordküste', 'South Coast': 'Südküste', 'East Coast': 'Ostküste', 'Sunrise spots': 'Sonnenaufgangsorte', 'Central Mountains': 'Zentralgebirge' },
  fr: { Mountains: 'Montagnes', Beaches: 'Plages', Towns: 'Villes', 'North Coast': 'Côte nord', 'South Coast': 'Côte sud', 'East Coast': 'Côte est', 'Sunrise spots': 'Lieux de lever du soleil', 'Central Mountains': 'Montagnes centrales' },
  es: { Mountains: 'Montañas', Beaches: 'Playas', Towns: 'Localidades', 'North Coast': 'Costa norte', 'South Coast': 'Costa sur', 'East Coast': 'Costa este', 'Sunrise spots': 'Lugares para el amanecer', 'Central Mountains': 'Montañas centrales' },
  pl: { Mountains: 'Góry', Beaches: 'Plaże', Towns: 'Miejscowości', 'North Coast': 'Północne wybrzeże', 'South Coast': 'Południowe wybrzeże', 'East Coast': 'Wschodnie wybrzeże', 'Sunrise spots': 'Miejsca na wschód słońca', 'Central Mountains': 'Góry centralne' },
  uk: {},
};

export function cameraPreviewLabel(locale: Locale) {
  return previewLabels[locale];
}

export function translateCameraLabel(locale: Locale, value: string) {
  return labelMaps[locale][value] ?? value;
}
