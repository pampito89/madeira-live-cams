import type { GetStaticProps, GetServerSideProps } from 'next';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defaultLocale, isSupportedLocale } from './config';
import type { TranslationCatalog } from './translation';
import scopes from './catalogs/scopes.json';

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
function collectPropText(value: unknown, keys: Set<string>) {
  if (typeof value === 'string') keys.add(normalize(value));
  else if (Array.isArray(value)) value.forEach(item => collectPropText(item, keys));
  else if (value && typeof value === 'object') Object.values(value).forEach(item => collectPropText(item, keys));
}
async function loadCatalog(locale: string | undefined, page: string, props: unknown): Promise<TranslationCatalog> {
  const language = isSupportedLocale(locale) ? locale : defaultLocale;
  const catalog: TranslationCatalog = JSON.parse(await readFile(join(process.cwd(), 'lib', 'i18n', 'catalogs', `${language}.json`), 'utf8'));
  const keys = new Set((scopes as Record<string, string[]>)[page] ?? []);
  collectPropText(props, keys);
  return Object.fromEntries(Object.entries(catalog).filter(([key]) => keys.has(normalize(key))));
}
export function withStaticTranslations<P extends Record<string, unknown>>(loader: GetStaticProps<P>, page: string): GetStaticProps<P> {
  return async context => {
    const result = await loader(context);
    if (!('props' in result)) return result;
    const props = await result.props;
    return { ...result, props: { ...props, translationCatalog: await loadCatalog(context.locale, page, props) } };
  };
}
export function withServerTranslations<P extends Record<string, unknown>>(loader: GetServerSideProps<P>, page: string): GetServerSideProps<P> {
  return async context => {
    const result = await loader(context);
    if (!('props' in result)) return result;
    const props = await result.props;
    return { ...result, props: { ...props, translationCatalog: await loadCatalog(context.locale, page, props) } };
  };
}
export function translatedStaticProps(page: string) {
  return withStaticTranslations(async () => ({ props: {} }), page);
}
