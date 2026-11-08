import type { GetServerSideProps } from 'next';
import CivilProtectionNews from '../../components/CivilProtectionNews';
import { getCivilProtectionNews, type NewsSnapshot } from '../../lib/civilProtectionNews';

export default function NewsPage({ snapshot }: { snapshot: NewsSnapshot }) {
  return <CivilProtectionNews snapshot={snapshot} />;
}
export const getServerSideProps: GetServerSideProps = async ({ locale, res }) => {
  if (locale !== 'en') return { redirect: { destination: '/news', permanent: false } };
  const snapshot = await getCivilProtectionNews();
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
  return { props: { snapshot } };
};
