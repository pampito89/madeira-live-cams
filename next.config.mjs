import { readFileSync } from 'node:fs';

const optimizedImages = JSON.parse(readFileSync(new URL('./data/optimized-images.json', import.meta.url), 'utf8'));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'pt', 'de', 'fr', 'es', 'pl', 'uk'],
    defaultLocale: 'en',
  },
  images: {
    loader: 'custom',
    loaderFile: './lib/images/loader.ts',
  },
  async headers() {
    return [{
      source: '/images/optimized/:path*',
      headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
    }];
  },
  async rewrites() {
    // Preserve existing CSS/plain-image URLs while serving compressed files.
    // Let Next apply locale matching, including its internal default locale.
    return {
      beforeFiles: Object.entries(optimizedImages).map(([source, image]) => ({
        source,
        destination: image.src,
      })),
    };
  },
  async redirects() {
    return [{
      source: '/:path*',
      has: [{ type: 'host', value: 'www.madeiralivecams.com' }],
      destination: 'https://madeiralivecams.com/:path*',
      permanent: true,
      locale: false,
    }];
  },
};

export default nextConfig;
