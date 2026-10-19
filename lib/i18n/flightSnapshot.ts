import type { Locale } from './config';
const copy: Record<Locale, [string, string, string]> = {
  en: ['Show flights', 'Today · Madeira time', 'No remaining flights today'],
  pt: ['Mostrar voos', 'Hoje · hora da Madeira', 'Não há mais voos previstos para hoje'],
  de: ['Flüge anzeigen', 'Heute · Ortszeit Madeira', 'Keine weiteren Flüge für heute'],
  fr: ['Afficher les vols', 'Aujourd’hui · heure de Madère', 'Aucun autre vol prévu aujourd’hui'],
  es: ['Mostrar vuelos', 'Hoy · hora de Madeira', 'No quedan vuelos previstos para hoy'],
  pl: ['Pokaż loty', 'Dzisiaj · czas Madery', 'Brak pozostałych lotów na dzisiaj'],
  uk: ['Показати рейси', 'Сьогодні · час Мадейри', 'На сьогодні більше немає очікуваних рейсів'],
};
export function flightSnapshotText(locale: Locale) {
  const [show, today, empty] = copy[locale];
  return { show, today, empty };
}
