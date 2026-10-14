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
        source: '/:path*',
        has: [{ type: 'host', value: 'www.madeiralivecams.com' }],
        destination: 'https://madeiralivecams.com/:path*',
        permanent: true,
        locale: false,
      },
    ];
  },
};

export default nextConfig;
