import Navbar from '@/components/Navbar';
import UrlShortForm from '@/components/UrlShortForm';
import { AppProvider } from '@/contexts/app.context';
import Layout from '@/components/Layout';
import Head from 'next/head';
import UtmInfoSmall from "@/components/UtmInfoSmall";
import useLang from "@/hooks/useLang";

function Home() {
  const lang = useLang();

  return (
    <>
      <Head>
          <title>{lang.get('metaTitle')}</title>
          <meta name="description" content={lang.get('metaDescription')} />
      </Head>

      <Layout>
        <Navbar />
        <UrlShortForm />
        <UtmInfoSmall />
      </Layout>
    </>
  );
}

export default function Init() {
  return (
    <AppProvider>
      <Home />
    </AppProvider>
  )
}