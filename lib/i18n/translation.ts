export type TranslationCatalog = Record<string, string>;
const placeholder = /__VAR_(\d+)__/g;
const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Immutable, request-local translation. Missing entries retain the original text. */
export function createTranslator(catalog: TranslationCatalog) {
  const exact = new Map(Object.entries(catalog).map(([key, value]) => [normalize(key), value]));
  const patterns = Object.entries(catalog)
    .filter(([key]) => key.includes('__VAR_'))
    .sort(([a], [b]) => b.length - a.length)
    .map(([key, value]) => {
      const normalized = normalize(key);
      const ids: string[] = [];
      const pieces: string[] = [];
      let position = 0;
      for (const match of Array.from(normalized.matchAll(placeholder))) {
        pieces.push(escape(normalized.slice(position, match.index)), '(.*?)');
        ids.push(match[1]);
        position = match.index! + match[0].length;
      }
      pieces.push(escape(normalized.slice(position)));
      return { regex: new RegExp(`^${pieces.join('')}$`), ids, value };
    });
  function text(value: string): string {
    if (!value.trim() || /^(https?:\/\/|\/)/.test(value)) return value;
    const direct = exact.get(normalize(value));
    if (direct !== undefined) return value.replace(value.trim(), direct.trim());
    // Keep line breaks in generated programmes; never run a pattern over the entire plan.
    if (value.includes('\n')) return value.split('\n').map(text).join('\n');
    for (const pattern of patterns) {
      const match = pattern.regex.exec(normalize(value));
      if (match) return pattern.value.replace(placeholder, (_, id: string) => match[pattern.ids.indexOf(id) + 1] ?? '');
    }
    return value;
  }
  function translate<T>(value: T): T {
    if (typeof value === 'string') return text(value) as T;
    if (Array.isArray(value)) return value.map(translate) as T;
    return value;
  }
  /** Interpolate before concatenation so empty or nested substitutions remain translatable. */
  function format(template: string, ...values: unknown[]): string {
    const translated = exact.get(normalize(template)) ?? template;
    return translated.replace(placeholder, (_, index: string) => {
      const value = values[Number(index)];
      return typeof value === 'string' ? text(value) : String(value ?? '');
    });
  }
  return Object.assign(translate, { format });
}
