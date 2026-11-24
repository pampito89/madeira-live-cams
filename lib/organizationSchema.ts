import { localePath, supportedLocales, type Locale } from './i18n/config';

const SITE_URL = 'https://madeiralivecams.com';
const SITE_NAME = 'Madeira Live Cams';
const LOGO_URL = `${SITE_URL}/icon-512.png`;
const DEFAULT_IMAGE_URL = `${SITE_URL}/images/pico-radar-desktop.png`;

function buildOrganizationEntity(description: string) {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
      width: 512,
      height: 512,
    },
    image: DEFAULT_IMAGE_URL,
    description,
    areaServed: {
      '@type': 'Place',
      name: 'Madeira, Portugal',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${SITE_URL}/about#contact`,
      availableLanguage: [...supportedLocales],
    },
  };
}

export function buildHomeStructuredData(locale: Locale, description: string) {
  const pageUrl = `${SITE_URL}${localePath(locale, '/')}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildOrganizationEntity(description),
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: pageUrl,
        inLanguage: locale,
        description,
        publisher: {
          '@id': `${SITE_URL}/#organization`,
        },
      },
    ],
  };
}

export function buildAboutStructuredData(locale: Locale, title: string, description: string) {
  const pageUrl = `${SITE_URL}${localePath(locale, '/about')}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildOrganizationEntity(description),
      {
        '@type': 'AboutPage',
        '@id': `${pageUrl}#webpage`,
        name: title,
        url: pageUrl,
        inLanguage: locale,
        description,
        about: {
          '@id': `${SITE_URL}/#organization`,
        },
        publisher: {
          '@id': `${SITE_URL}/#organization`,
        },
      },
    ],
  };
}
