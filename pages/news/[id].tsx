import type { GetStaticPaths, GetStaticProps } from 'next';
import CivilProtectionNews from '../../components/CivilProtectionNews';
import { getNewsSources, localizeNews } from '../../lib/siteNews';
import type { SiteNewsArticle } from '../../lib/newsTypes';
import { isSupportedLocale, defaultLocale, supportedLocales } from '../../lib/i18n/config';

export default function NewsArticlePage({ article }: { article: SiteNewsArticle }) {
  return <CivilProtectionNews snapshot={{ articles: [] }} article={article} />;
}

// Generate existing articles, including archived revisions, in every language
// before deployment so opening them never needs a cold source import.
export const getStaticPaths: GetStaticPaths = async () => {
  const snapshot = await getNewsSources();
  return {
    paths: snapshot.articles.flatMap(({ id }) => supportedLocales.map(locale => ({ params: { id }, locale }))),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const id = params?.id;
  if (typeof id !== 'string' || !/^(?:\d{1,12}|ifcn-\d{1,12}|dre-\d{1,12}|dre-status|rtp-[a-f0-9]{12})(?:-v-[a-f0-9]{12})?$/.test(id)) return { notFound: true, revalidate: 60 };
  const snapshot = await getNewsSources();
  const source = snapshot.articles.find(item => item.id === id);
  if (!source) return { notFound: true, revalidate: 60 };
  const article = await localizeNews(source, true, isSupportedLocale(locale) ? locale : defaultLocale);
  return { props: { article }, revalidate: 60 };
};
