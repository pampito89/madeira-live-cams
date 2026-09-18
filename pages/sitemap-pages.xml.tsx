import type { GetServerSideProps } from 'next';
import { cameras } from '../components/cameraData';
import { locations } from '../data/plannerLocations';
import { stays } from '../data/stays';

const ORIGIN = 'https://madeiralivecams.com';

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
    };
    return entities[character];
  });
}

function urlEntry(path: string, locale: 'en' | 'uk') {
  const english = `${ORIGIN}${path}`;
  const ukrainian = `${ORIGIN}/uk${path === '/' ? '' : path}`;
  const url = locale === 'uk' ? ukrainian : english;
  return [
    '  <url>',
    `    <loc>${escapeXml(url)}</loc>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(english)}" />`,
    `    <xhtml:link rel="alternate" hreflang="uk" href="${escapeXml(ukrainian)}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(english)}" />`,
    '  </url>',
  ].join('\n');
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const paths = [
    '/', '/cameras', '/weather-guide', '/about', '/parties', '/privacy', '/trip-plan',
    ...cameras.map((camera) => `/cameras/${camera.id}`),
    ...locations.filter((location) => !location.hiddenFromExplore).map((location) => `/explore/${location.slug}`),
    ...stays.map((stay) => `/stays/${stay.slug}`),
  ];
  const uniquePaths = Array.from(new Set(paths));
  const entries = uniquePaths.flatMap((path) => [urlEntry(path, 'en'), urlEntry(path, 'uk')]);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.end(xml);
  return { props: {} };
};

export default function SitemapPages() {
  return null;
}
