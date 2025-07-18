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
      </Head>

      <Layout>
        <Navbar />
        <Form />
      </Layout>
    </>
  );
}

export default function() {
  return (
    <AppProvider>
      <Home />
    </AppProvider>
  )
}