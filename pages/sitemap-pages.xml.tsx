import type { GetServerSideProps } from 'next';
import { cameras } from '../components/cameraData';
import { locations } from '../data/plannerLocations';
import { stays } from '../data/stays';
import { localePath, supportedLocales, type Locale } from '../lib/i18n/config';

const ORIGIN = 'https://madeiralivecams.com';
const establishedLocales: Locale[] = ['en', 'uk'];

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
    return entities[character];
  });
}

function urlEntry(path: string, locale: Locale, alternates: readonly Locale[]) {
  const url = `${ORIGIN}${localePath(locale, path)}`;
  return [
    '  <url>',
    `    <loc>${escapeXml(url)}</loc>`,
    ...alternates.map((alternate) => `    <xhtml:link rel="alternate" hreflang="${alternate}" href="${escapeXml(`${ORIGIN}${localePath(alternate, path)}`)}" />`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${ORIGIN}${localePath('en', path)}`)}" />`,
    '  </url>',
  ].join('\n');
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const establishedPaths = [
    '/cameras', '/weather-guide', '/about', '/parties', '/privacy', '/trip-plan', '/trail-availability',
    ...cameras.map((camera) => `/cameras/${camera.id}`),
    ...locations.filter((location) => !location.hiddenFromExplore).map((location) => `/explore/${location.slug}`),
    ...stays.map((stay) => `/stays/${stay.slug}`),
  ];
  const uniqueEstablishedPaths = Array.from(new Set(establishedPaths));
  const homepageEntries = supportedLocales.map((locale) => urlEntry('/', locale, supportedLocales));
  const establishedEntries = uniqueEstablishedPaths.flatMap((path) => establishedLocales.map((locale) => urlEntry(path, locale, establishedLocales)));
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...homepageEntries,
    ...establishedEntries,
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
