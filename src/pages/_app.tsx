import '@/styles/globals.css';
import Head from 'next/head';
import { AppProvider } from '@/contexts/app.context'; // 👈 Asegúrate de que esta ruta sea correcta

const App: React.FC<any> = ({ Component, pageProps }) => {
  return (
    <AppProvider> {/* 👈 Aquí envolvemos la app */}
      <>
        <Head>
          <title>iny.one – Shorten URLs, Track Smarter</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="iny.one is a free URL shortener with UTM tracking. Create short links and measure your marketing results." />

          {/* Favicon & Manifest */}
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <meta name="theme-color" content="#ffffff" />

          {/* Open Graph */}
          <meta property="og:title" content="iny.one – Shorten URLs, Track Smarter" />
          <meta property="og:description" content="iny.one is a free URL shortener with UTM tracking. Create short links and measure your marketing results." />
          <meta property="og:image" content="https://www.iny.one/og-image.png" />
          <meta property="og:url" content="https://www.iny.one" />
          <meta property="og:type" content="website" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="iny.one – Shorten URLs, Track Smarter" />
          <meta name="twitter:description" content="iny.one is a free URL shortener with UTM tracking. Create short links and measure your marketing results." />
          <meta name="twitter:image" content="https://www.iny.one/og-image.png" />
        </Head>

        <Component {...pageProps} />
      </>
    </AppProvider>
  );
};

export default App;

