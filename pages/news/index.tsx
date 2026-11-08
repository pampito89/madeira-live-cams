import type { GetServerSideProps } from 'next';
import CivilProtectionNews, { type UkrainianNewsSnapshot } from '../../components/CivilProtectionNews';
import { getCivilProtectionNews } from '../../lib/civilProtectionNews';
import { ukrainianArticle } from '../../lib/civilProtectionUkrainian';

export default function NewsPage({ snapshot }: { snapshot: UkrainianNewsSnapshot }) {
  return <CivilProtectionNews snapshot={snapshot} />;
}
export const getServerSideProps: GetServerSideProps = async ({ locale, res }) => {
  if (locale !== 'uk') return { redirect: { destination: '/uk/news', permanent: false } };
  const source = await getCivilProtectionNews();
  const articles = await Promise.all(source.articles.map(article => ukrainianArticle(article, false)));
  const snapshot = { ...source, articles: articles.map(article => ({ ...article, paragraphs: [article.paragraphs.find(paragraph => paragraph.length > 80) ?? article.paragraphs[0]] })) };
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
  return { props: { snapshot } };
};
