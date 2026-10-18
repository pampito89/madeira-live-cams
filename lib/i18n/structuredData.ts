/** Translate descriptive Schema.org fields without modifying types, URLs or identifiers. */
export function localizeStructuredData(value: unknown, translate: <T>(value: T) => T): unknown {
  if (Array.isArray(value)) return value.map(item => localizeStructuredData(item, translate));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, field]) => [
    key,
    ['name', 'description', 'headline', 'text', 'caption', 'articleBody'].includes(key) && typeof field === 'string'
      ? translate(field)
      : localizeStructuredData(field, translate),
  ]));
}
