import type { GetServerSideProps } from 'next';
import CivilProtectionNews from '../../components/CivilProtectionNews';
import { getSiteNews, newsCategory } from '../../lib/siteNews';
import type { SiteNewsSnapshot, newsCategories } from '../../lib/newsTypes';
import { isSupportedLocale, defaultLocale } from '../../lib/i18n/config';
export default function NewsPage({ snapshot, category }: { snapshot: SiteNewsSnapshot; category: keyof typeof newsCategories }) {
  return <CivilProtectionNews snapshot={snapshot} category={category} />;
}
export const getServerSideProps: GetServerSideProps = async ({ locale, query, res }) => {
  const category = newsCategory(query.category);
  const language = isSupportedLocale(locale) ? locale : defaultLocale;
  const snapshot = await getSiteNews(language);
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
  return { props: { snapshot, category } };
};
