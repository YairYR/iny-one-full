import { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=300; includeSubDomains' }, // 5 minutes
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()' },
];

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    }
  },
  images: {
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
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
      },
      {
        source: '/piscolas',
        destination: '/ui/piscolas',
        permanent: false
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/ui',
      },
      {
        source: '/about',
        destination: '/ui/about',
      },
    ]
  }
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
