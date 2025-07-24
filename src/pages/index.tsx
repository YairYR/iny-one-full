import Navbar from '@/components/navbar';
import Form from '@/components/containers/form';
import { AppProvider, useAppContext } from '@/contexts/app.context';
import Layout from '@/components/layout';
import Head from 'next/head';

function Home() {
  const { lang } = useAppContext();

  return (
    <>
      <Head>
        <title>{lang.get('metaTitle')}</title>
        <meta name="description" content={lang.get('metaDescription')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <link rel="canonical" href="https://www.iny.one/" />

        {/* Schema Markup for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "iny.one",
              "url": "https://www.iny.one",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.iny.one/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </Head>

      <Layout>
        <Navbar />
        <main className="px-4 py-12 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            {lang.get('h1Main') || "iny.one – Acortador de URLs con parámetros UTM"}
          </h1>

          <Form />

          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
              {lang.get('benefitsTitle') || '¿Por qué usar iny.one?'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <svg className="h-8 w-8 text-indigo-600 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                <h3 className="font-semibold text-gray-800 mb-2">{lang.get('fast')}</h3>
                <p className="text-sm text-gray-600">{lang.get('fastDesc')}</p>
              </div>

              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <svg className="h-8 w-8 text-indigo-600 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 005 5m0 0a5 5 0 01-5-5m0 0a5 5 0 01-5-5m0 0a5 5 0 015 5z"/></svg>
                <h3 className="font-semibold text-gray-800 mb-2">{lang.get('utmReady')}</h3>
                <p className="text-sm text-gray-600">{lang.get('utmDesc')}</p>
              </div>

              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <svg className="h-8 w-8 text-indigo-600 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h3v-4a2 2 0 012-2h6a2 2 0 012 2v4h3a2 2 0 002-2V5a2 2 0 00-2-2h-3v4H8z"/></svg>
                <h3 className="font-semibold text-gray-800 mb-2">{lang.get('easy')}</h3>
                <p className="text-sm text-gray-600">{lang.get('easyDesc')}</p>
              </div>
            </div>
          </section>
        </main>
      </Layout>
    </>
  );
}

export default function IndexPage() {
  return (
    <AppProvider>
      <Home />
    </AppProvider>
  );
}
