import type React from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import "@/styles/globals.css";
import { getLocale } from "next-intl/server";
import Script from "next/script";
import { IS_PRODUCTION } from "@/constants";

export const metadata: Metadata = {
  metadataBase: new URL("https://iny.one"),
  applicationName: "iny.one",
  title: "iny.one – Shorten URLs, Track Smarter",
  description:
    "iny.one is a free URL shortener with UTM tracking. Create short links and measure your marketing results.",
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "WNueup03P4lmVxxos0qDu1zwMrCeEpuS4FVUuS0XHtM",
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "iny.one",
    title: "iny.one – Shorten URLs, Track Smarter",
    description:
      "iny.one is a free URL shortener with UTM tracking. Create short links and measure your marketing results.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "iny.one – Shorten URLs, Track Smarter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iny.one – Shorten URLs, Track Smarter",
    description:
      "iny.one is a free URL shortener with UTM tracking. Create short links and measure your marketing results.",
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>

        {IS_PRODUCTION && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-KT87SQKGT4"
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-KT87SQKGT4', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
