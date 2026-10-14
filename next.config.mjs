/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  i18n: {
    locales: ['en', 'uk'],
    defaultLocale: 'en',
  },

  async redirects() {
    return [
      {
        source: '/en',
        has: [{ type: 'host', value: 'www.madeiralivecams.com' }],
        destination: 'https://madeiralivecams.com/',
        permanent: true,
        locale: false,
      },
      {
        source: '/en/:path*',
        has: [{ type: 'host', value: 'www.madeiralivecams.com' }],
        destination: 'https://madeiralivecams.com/:path*',
        permanent: true,
        locale: false,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.madeiralivecams.com' }],
        destination: 'https://madeiralivecams.com/:path*',
        permanent: true,
        locale: false,
      },
      {
        source: '/en',
        destination: '/',
        permanent: true,
        locale: false,
      },
      {
        source: '/en/:path*',
        destination: '/:path*',
        permanent: true,
        locale: false,
      },
    ];
  },
};

export default nextConfig;
