import Head from "next/head"
import Script from "next/script"
import { useAppContext } from "@/contexts/app.context"
import { IS_PRODUCTION } from "@/constants";

const Header = () => {
  const { lang } = useAppContext()

  return (
    <>
      <Head>
        {/* SEO básico */}
        <title>{lang.get("metaTitle")}</title>
        <meta name="description" content={lang.get("metaDescription")} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />

        {/* Open Graph */}
        <meta property="og:title" content={lang.get("metaTitle")} />
        <meta property="og:description" content={lang.get("metaDescription")} />
        <meta property="og:url" content="https://www.iny.one" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.iny.one/og-image.png" />

        {/* PWA y favicon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#4f46e5" />

        {/* iOS Web App */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Head>

      {IS_PRODUCTION && (
        <>
          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-KT87SQKGT4"
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-KT87SQKGT4');
            `}
              </Script>
        </>
      )}

    </>
  )
}

export default Header

