import type { Locale } from './config';
const copy: Record<Locale, [string, string, string, string, string]> = {
  en: ['Show flights', 'Today · Madeira time', 'No remaining flights today', 'Status unconfirmed', 'Refresh needed'],
  pt: ['Mostrar voos', 'Hoje · hora da Madeira', 'Não há mais voos previstos para hoje', 'Estado por confirmar', 'Atualização necessária'],
  de: ['Flüge anzeigen', 'Heute · Ortszeit Madeira', 'Keine weiteren Flüge für heute', 'Status unbestätigt', 'Bitte aktualisieren'],
  fr: ['Afficher les vols', 'Aujourd’hui · heure de Madère', 'Aucun autre vol prévu aujourd’hui', 'Statut à confirmer', 'Actualisation nécessaire'],
  es: ['Mostrar vuelos', 'Hoy · hora de Madeira', 'No quedan vuelos previstos para hoy', 'Estado sin confirmar', 'Actualización necesaria'],
  pl: ['Pokaż loty', 'Dzisiaj · czas Madery', 'Brak pozostałych lotów na dzisiaj', 'Status niepotwierdzony', 'Wymaga odświeżenia'],
  uk: ['Показати рейси', 'Сьогодні · час Мадейри', 'На сьогодні більше немає очікуваних рейсів', 'Потребує уточнення', 'Потрібно оновити'],
};
export function flightSnapshotText(locale: Locale) {
  const [show, today, empty, unconfirmed, refreshNeeded] = copy[locale];
  return { show, today, empty, unconfirmed, refreshNeeded };
}
