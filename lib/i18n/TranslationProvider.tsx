import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { createTranslator, type TranslationCatalog } from './translation';
import { defaultLocale, isSupportedLocale } from './config';

const TranslationContext = createContext(createTranslator({}));

/** Compile the selected static catalog once per page, before rendering its children. */
export function TranslationProvider({ catalog, children }: { catalog: TranslationCatalog; children: ReactNode }) {
  const translate = useMemo(() => createTranslator(catalog), [catalog]);
  return <TranslationContext.Provider value={translate}>{children}</TranslationContext.Provider>;
}

export function useText() {
  const translate = useContext(TranslationContext);
  const { locale } = useRouter();
  const language = isSupportedLocale(locale) ? locale : defaultLocale;
  return { translate, format: translate.format, language };
}
