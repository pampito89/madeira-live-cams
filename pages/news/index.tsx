import type { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import CivilProtectionNews from '../../components/CivilProtectionNews';
import { getSiteNews } from '../../lib/siteNews';
import { newsCategories, type SiteNewsSnapshot } from '../../lib/newsTypes';
import { isSupportedLocale, defaultLocale } from '../../lib/i18n/config';

export default function NewsPage({ snapshot }: { snapshot: SiteNewsSnapshot }) {
  const { query } = useRouter();
  const category = typeof query.category === 'string' && Object.hasOwn(newsCategories, query.category)
    ? query.category as keyof typeof newsCategories : 'all';
  return <CivilProtectionNews snapshot={snapshot} category={category} />;
}

// Serve pre-rendered HTML/JSON immediately, refreshing sources and translations in
// the background. Category queries share the same edition and filter locally.
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const snapshot = await getSiteNews(isSupportedLocale(locale) ? locale : defaultLocale);
  return { props: { snapshot }, revalidate: 60 };
};
