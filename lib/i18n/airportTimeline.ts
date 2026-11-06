import type { Locale } from './config';

const copy: Record<Locale, string[]> = {
  en: ['Weather & flight schedule', 'Weather warning timeline', 'Next 72 hours · UTC', 'No warning issued', 'Scroll to see all hours', 'South coast of Madeira · IPMA warnings, not airport operating status.'],
  uk: ['Погода та розклад польотів', 'Графік погодних попереджень', 'Наступні 72 години · UTC', 'Попередження не оголошено', 'Прокрутіть, щоб побачити всі години', 'Південне узбережжя Мадейри · Попередження IPMA, а не статус роботи аеропорту.'],
  pt: ['Meteorologia e horários de voos', 'Cronologia dos avisos meteorológicos', 'Próximas 72 horas · UTC', 'Sem aviso emitido', 'Deslize para ver todas as horas', 'Costa sul da Madeira · Avisos IPMA, não o estado operacional do aeroporto.'],
  de: ['Wetter und Flugplan', 'Zeitverlauf der Wetterwarnungen', 'Nächste 72 Stunden · UTC', 'Keine Warnung ausgegeben', 'Scrollen, um alle Stunden zu sehen', 'Südküste Madeiras · IPMA-Warnungen, kein Betriebsstatus des Flughafens.'],
  fr: ['Météo et horaires des vols', 'Chronologie des alertes météo', 'Prochaines 72 heures · UTC', 'Aucune alerte émise', 'Faites défiler pour voir toutes les heures', 'Côte sud de Madère · Alertes IPMA, pas le statut opérationnel de l’aéroport.'],
  es: ['Tiempo y horarios de vuelos', 'Cronología de avisos meteorológicos', 'Próximas 72 horas · UTC', 'Sin aviso emitido', 'Desliza para ver todas las horas', 'Costa sur de Madeira · Avisos IPMA, no el estado operativo del aeropuerto.'],
  pl: ['Pogoda i rozkład lotów', 'Oś czasu ostrzeżeń pogodowych', 'Najbliższe 72 godziny · UTC', 'Nie wydano ostrzeżenia', 'Przewiń, aby zobaczyć wszystkie godziny', 'Południowe wybrzeże Madery · Ostrzeżenia IPMA, nie status operacyjny lotniska.'],
};

export function airportTimelineText(locale: Locale) {
  const [button, heading, period, green, scroll, scope] = copy[locale];
  return { button, heading, period, green, scroll, scope };
}
