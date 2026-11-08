import type { GetServerSideProps } from 'next';
import CivilProtectionNews, { type UkrainianNewsSnapshot } from '../../components/CivilProtectionNews';
import { getCivilProtectionNews } from '../../lib/civilProtectionNews';
import { ukrainianArticle, type UkrainianNewsArticle } from '../../lib/civilProtectionUkrainian';

export default function NewsArticlePage({ snapshot, article }: { snapshot: UkrainianNewsSnapshot; article: UkrainianNewsArticle }) {
  return <CivilProtectionNews snapshot={snapshot} article={article} />;
}
export const getServerSideProps: GetServerSideProps = async ({ params, locale, res }) => {
  const id = params?.id;
  if (typeof id !== 'string' || !/^\d{1,12}$/.test(id)) return { notFound: true };
  if (locale !== 'uk') return { redirect: { destination: `/uk/news/${id}`, permanent: false } };
  const snapshot = await getCivilProtectionNews();
  const source = snapshot.articles.find(item => item.id === id);
  if (!source) return { notFound: true };
  const article = await ukrainianArticle(source);
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
  return { props: { article, snapshot: { ...snapshot, articles: [] } } };
};
