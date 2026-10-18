import Head from 'next/head';
import { useText } from '../lib/i18n/TranslationProvider';

type Props = { name: string; description: string; url: string; mapUrl: string; image?: string };
export default function PlaceStructuredData({ name, description, url, mapUrl, image }: Props) {
  const { translate, language } = useText();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: translate(name),
    description: translate(description),
    url,
    inLanguage: language,
    mainEntity: {
      '@type': 'Place', name: translate(name), description: translate(description), url,
      hasMap: mapUrl, ...(image ? { image } : {}),
    },
  };
  return <Head><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /></Head>;
}
