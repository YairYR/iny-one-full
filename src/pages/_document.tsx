import { Html, Head, Main, NextScript } from 'next/document';
import { GoogleAnalytics } from '@next/third-parties/google';
import { IS_PRODUCTION } from "@/constants";

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Meta tag para verificación de Google Search Console */}
        <meta name="google-site-verification" content="WNueup03P4lmVxxos0qDu1zwMrCeEpuS4FVUuS0XHtM" />

        {/* Google Ads Global Site Tag */}
        {IS_PRODUCTION && (
          <GoogleAnalytics gaId="AW-963256646" />
        )}

      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
