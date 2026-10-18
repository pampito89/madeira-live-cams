/** Locale-aware units and plural forms for itinerary durations. */
export function formatDuration(minutes: number, locale: string, unitDisplay: 'short' | 'long' = 'short'): string {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  const unit = (value: number, name: 'hour' | 'minute') => new Intl.NumberFormat(locale, {
    style: 'unit', unit: name, unitDisplay,
  }).format(value);
  if (!hours) return unit(remainder, 'minute');
  return remainder ? `${unit(hours, 'hour')} ${unit(remainder, 'minute')}` : unit(hours, 'hour');
}
