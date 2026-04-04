import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=300; includeSubDomains" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  images: {
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/es/:path*",
        locale: false,
        headers: [
          {
            key: "Content-Language",
            value: "es",
          },
        ],
      },
      {
        source: "/en/:path*",
        locale: false,
        headers: [
          {
            key: "Content-Language",
            value: "en",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Dominio canónico: www -> apex
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.iny.one",
          },
        ],
        destination: "https://iny.one/:path*",
        permanent: true,
      },

      // Elimina acceso público duplicado a rutas internas /ui/*
      {
        source: "/ui",
        destination: "/",
        permanent: true,
      },
      {
        source: "/ui/about",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/ui/piscolas",
        destination: "/piscolas",
        permanent: true,
      },
      {
        source: "/ui/cart",
        destination: "/cart",
        permanent: true,
      },
      {
        source: "/ui/plans",
        destination: "/plans",
        permanent: true,
      },
      {
        source: "/ui/auth/login",
        destination: "/auth/login",
        permanent: true,
      },
      {
        source: "/ui/auth/register",
        destination: "/auth/register",
        permanent: true,
      },
      {
        source: "/ui/dashboard",
        destination: "/dashboard",
        permanent: true,
      },

      // Alias técnico
      {
        source: "/bloom.bin",
        destination: "/favicon.ico",
        permanent: false,
      },
    ];
  },

  async rewrites() {
    return [
      // URLs públicas limpias -> implementación interna
      {
        source: "/",
        destination: "/ui",
      },
      {
        source: "/about",
        destination: "/ui/about",
      },
      {
        source: "/piscolas",
        destination: "/ui/piscolas",
      },
      {
        source: "/cart",
        destination: "/ui/cart",
      },
      {
        source: "/plans",
        destination: "/ui/plans",
      },
      {
        source: "/auth/login",
        destination: "/ui/auth/login",
      },
      {
        source: "/auth/register",
        destination: "/ui/auth/register",
      },
      {
        source: "/dashboard",
        destination: "/ui/dashboard",
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: "./data/lang/en.json",
  },
});

export default withNextIntl(nextConfig);
