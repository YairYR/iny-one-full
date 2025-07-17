import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Meta tag para verificación de Google Search Console */}
        <meta name="google-site-verification" content="WNueup03P4lmVxxos0qDu1zwMrCeEpuS4FVUuS0XHtM" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
