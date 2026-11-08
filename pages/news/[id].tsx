import type { GetServerSideProps } from 'next';
import CivilProtectionNews from '../../components/CivilProtectionNews';
import { getCivilProtectionNews, type NewsArticle, type NewsSnapshot } from '../../lib/civilProtectionNews';

export default function NewsArticlePage({ snapshot, article }: { snapshot: NewsSnapshot; article: NewsArticle }) {
  return <CivilProtectionNews snapshot={snapshot} article={article} />;
}
export const getServerSideProps: GetServerSideProps = async ({ params, locale, res }) => {
  const id = params?.id;
  if (typeof id !== 'string' || !/^\d{1,12}$/.test(id)) return { notFound: true };
  if (locale !== 'en') return { redirect: { destination: `/news/${id}`, permanent: false } };
  const snapshot = await getCivilProtectionNews();
  const article = snapshot.articles.find(item => item.id === id);
  if (!article) return { notFound: true };
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
  return { props: { article, snapshot: { ...snapshot, articles: [] } } };
};
