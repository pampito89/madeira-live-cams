import type { Locale } from './i18n/config';

type Meal = 'breakfast' | 'lunch' | 'dinner';
const labels: Record<Locale, Record<Meal | 'meal', string>> = {
  en: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', meal: 'Meal' },
  pt: { breakfast: 'Pequeno-almoço', lunch: 'Almoço', dinner: 'Jantar', meal: 'Refeição' },
  de: { breakfast: 'Frühstück', lunch: 'Mittagessen', dinner: 'Abendessen', meal: 'Mahlzeit' },
  fr: { breakfast: 'Petit-déjeuner', lunch: 'Déjeuner', dinner: 'Dîner', meal: 'Repas' },
  es: { breakfast: 'Desayuno', lunch: 'Almuerzo', dinner: 'Cena', meal: 'Comida' },
  pl: { breakfast: 'Śniadanie', lunch: 'Obiad', dinner: 'Kolacja', meal: 'Posiłek' },
  uk: { breakfast: 'Сніданок', lunch: 'Обід', dinner: 'Вечеря', meal: 'Прийом їжі' },
};
const at: Record<Locale, string> = { en: 'at', pt: 'em', de: 'bei', fr: 'chez', es: 'en', pl: 'w', uk: 'в' };
export function mealTypeForTime(time: string): Meal | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const hour = Number(time.slice(0, 2));
  return hour < 12 ? 'breakfast' : hour < 17 ? 'lunch' : 'dinner';
}
export function restaurantMealLabel(time: string, locale: Locale) {
  return labels[locale][mealTypeForTime(time) ?? 'meal'];
}
export function restaurantStopTitle(name: string, time: string, locale: Locale) {
  return `${restaurantMealLabel(time, locale)} ${at[locale]} ${name}`;
}
