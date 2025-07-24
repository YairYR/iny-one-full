import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Meta tag para verificación de Google Search Console */}
        <meta name="google-site-verification" content="WNueup03P4lmVxxos0qDu1zwMrCeEpuS4FVUuS0XHtM" />

        {/* Google Ads Global Site Tag */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-963256646"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-963256646');
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
