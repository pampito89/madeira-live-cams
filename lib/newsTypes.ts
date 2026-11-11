import type { Locale } from './i18n/config';
export const newsCategories = { all: 'Усі новини', trails: 'Стежки', roads: 'Дороги', weather: 'Наслідки негоди', general: 'Інші повідомлення' } as const;
export type NewsCategory = Exclude<keyof typeof newsCategories, 'all'>;
export type NewsLifecycle = {
  newsState?: 'current' | 'archived' | 'unverified';
  archiveReason?: string | null;
  replacementId?: string | null;
  sortDate?: string | null;
};
export type SiteNewsArticle = NewsLifecycle & {
  id: string; title: string; paragraphs: string[]; sourceUrl: string; sourceName: string;
  publishedAt: string | null; checkedAt: string; stale: boolean;
  categories: NewsCategory[]; location: string; period: string | null;
  contentLanguage: Locale; translationKind: 'edited' | 'machine' | 'original';
};
export type SiteNewsSnapshot = { articles: SiteNewsArticle[] };
