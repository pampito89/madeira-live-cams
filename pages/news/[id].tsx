import type { GetServerSideProps } from 'next';
import CivilProtectionNews from '../../components/CivilProtectionNews';
import { getNewsSources, localizeNews } from '../../lib/siteNews';
import type { SiteNewsArticle } from '../../lib/newsTypes';
export default function NewsArticlePage({ article }: { article: SiteNewsArticle }) {
  return <CivilProtectionNews snapshot={{ articles: [] }} article={article} />;
}
export const getServerSideProps: GetServerSideProps = async ({ params, locale, res }) => {
  const id = params?.id;
  if (typeof id !== 'string' || !/^(?:\d{1,12}|ifcn-\d{1,12}|dre-\d{1,12}|dre-status|rtp-[a-f0-9]{12})(?:-v-[a-f0-9]{12})?$/.test(id)) return { notFound: true };
  if (locale !== 'uk') return { redirect: { destination: `/uk/news/${id}`, permanent: false } };
  const snapshot = await getNewsSources();
  const source = snapshot.articles.find(item => item.id === id);
  if (!source) return { notFound: true };
  const article = await localizeNews(source);
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
  return { props: { article } };
};
