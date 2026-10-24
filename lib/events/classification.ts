import { categories, type IslandEvent } from '../../data/events';
import type { Locale } from '../i18n/config';
import type { ImportedEvent } from './types';
import { eventText } from './text';

const racingNames: Record<Locale, string> = { en: 'Motorsport', uk: 'Перегони', pt: 'Desporto motorizado', de: 'Motorsport', fr: 'Sports mécaniques', es: 'Deportes de motor', pl: 'Sporty motorowe' };
export function eventCategoryName(locale: Locale, category: IslandEvent['category']) {
  return category === 'Racing' ? racingNames[locale] : eventText(locale).categories[categories.indexOf(category)];
}
// Apply on every feed read, including cached source records, before translating titles.
export function classifyCompetition(event: ImportedEvent): ImportedEvent {
  const title = event.originalTitle.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const motor = /\b(kart(?:ing|s)?|go[ -]?karts?|motorsports?|motor[ -]racing|auto[ -]racing|automobilismo|automovel|automoveis|motociclismo|motorcycl(?:es?|ing)|motorbikes?|moto(?:cross|gp)?|supermoto|autocross|rallycross|rallye|ralis?|ral(?:ly|lies)|bugg(?:y|ies)|quad(?:s|cross)?|drifting|car racing|car race)\b/.test(title);
  const physical = /\b(cycling|ciclismo|bicicletas?|bicycle|mountain bik(?:e|ing)|mtb|btt|running|trail run(?:ning)?|marathon|maratona|triathlon|triatlo|swim(?:ming)?|natacao|kayak(?:ing)?|caiaque|cano(?:e|eing|agem)|rowing|remo|surf(?:ing)?|sailing|vela|athletics|atletismo|football|futebol|tennis|tenis|padel|basketball|basquetebol|volleyball|voleibol)\b/.test(title);
  // Bicycle/canoe rallies are human-powered; explicit motor disciplines still win.
  const nonMotorRally = physical && /\bral(?:ly|lies|i)\b/.test(title) && !/\b(motor|moto|car|kart|auto)/.test(title);
  const hillClimb = /\b(rampa|hill[ -]?climb)\b/.test(title) && !physical;
  const category = (motor && !nonMotorRally) || hillClimb ? 'Racing' : physical ? 'Sport' : event.sourceId === 'amak' ? 'Racing' : event.category;
  return category === event.category ? event : { ...event, category };
}
