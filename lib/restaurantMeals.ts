import type { Locale } from '../data/locations';

export function mealTypeForTime(time: string): 'breakfast' | 'lunch' | 'dinner' | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const hour = Number(time.slice(0, 2));
  return hour < 12 ? 'breakfast' : hour < 17 ? 'lunch' : 'dinner';
}

export function restaurantMealLabel(time: string, locale: Locale) {
  const meal = mealTypeForTime(time);
  const labels = locale === 'uk'
    ? { breakfast: 'Сніданок', lunch: 'Обід', dinner: 'Вечеря' }
    : { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
  return meal ? labels[meal] : locale === 'uk' ? 'Прийом їжі' : 'Meal';
}

export function restaurantStopTitle(name: string, time: string, locale: Locale) {
  return locale === 'uk'
    ? `${restaurantMealLabel(time, locale)} в ${name}`
    : `${restaurantMealLabel(time, locale)} at ${name}`;
}
