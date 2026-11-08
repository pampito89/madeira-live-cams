import type { GetServerSideProps } from 'next';
import CivilProtectionNews from '../../components/CivilProtectionNews';
import { getSiteNews, newsCategory } from '../../lib/siteNews';
import type { SiteNewsSnapshot, newsCategories } from '../../lib/newsTypes';
export default function NewsPage({ snapshot, category }: { snapshot: SiteNewsSnapshot; category: keyof typeof newsCategories }) {
  return <CivilProtectionNews snapshot={snapshot} category={category} />;
}
export const getServerSideProps: GetServerSideProps = async ({ locale, query, res }) => {
  const category = newsCategory(query.category);
  if (locale !== 'uk') return { redirect: { destination: `/uk/news${category === 'all' ? '' : `?category=${category}`}`, permanent: false } };
  const source = await getSiteNews();
  const snapshot = { articles: source.articles.map(item => ({ ...item, paragraphs: [item.paragraphs.find(paragraph => paragraph.length > 80) ?? item.paragraphs[0] ?? ''] })) };
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
  return { props: { snapshot, category } };
};
