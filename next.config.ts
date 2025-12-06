import { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    }
  },
  async headers() {
    return [
      {
        source: '/:short',
        locale: false,
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ],
        has: [
          {
            type: 'header',
            key: 'sec-fetch-dest',
            value: 'document'
          }
        ],
      },
      {
        source: '/:short',
        locale: false,
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow'
          }
        ],
        missing: [
          {
            type: 'header',
            key: 'sec-fetch-dest'
          }
        ],
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
  },
  async redirects() {
    return [
      {
        source: '/bloom.bin',
        destination: '/favicon.ico',
        permanent: false
      }
    ]
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
