import '@/styles/globals.css';
import Head from 'next/head';
import React from "react";

interface Props {
    Component: React.JSXElementConstructor<unknown>;
    pageProps: object;
}

const App: React.FC<Props> = ({ Component, pageProps }) => {
  return (
    <>
        <Head>
            <meta charSet="UTF-8"/>
            <title>iny.one – Shorten URLs, Track Smarter</title>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <meta name="description"
                  content="iny.one is a free URL shortener with UTM tracking. Create short links and measure your marketing results."/>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
            <link rel="manifest" href="/site.webmanifest"/>
            <link rel="shortcut icon" href="/favicon.ico"/>
            <meta name="theme-color" content="#ffffff"/>
        </Head>
        <Component {...pageProps} />
    </>
  );
};

export default App;
