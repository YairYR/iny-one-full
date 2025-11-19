import { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'en',
  },
  async headers() {
    return [
      {
        source: '/:short',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ]
      },
      {
        source: '/es/:path*',
        locale: false,
        headers: [
          {
            key: 'Content-Language',
            value: 'es'
          }
        ]
      },
      {
        source: '/en/:path*',
        locale: false,
        headers: [
          {
            key: 'Content-Language',
            value: 'en'
          }
        ]
      },
    ]
  }
};

export default nextConfig;
