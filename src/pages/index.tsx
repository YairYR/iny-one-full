import HomeTitle from '@/components/HomeTitle';
import UrlShortForm from '@/features/short_links/components/UrlShortForm';
import { AppProvider } from '@/contexts/app.context';
import LayoutMain from '@/components/layouts/LayoutMain';
import Head from 'next/head';
import UtmInfoSmall from "@/components/UtmInfoSmall";
import useLang from "@/hooks/useLang";
import type { GetServerSidePropsContext } from "next";
import { createClient } from "@/utils/supabase/server";
import { UserClient } from "@/lib/types";
import { getCurrentUserFromSession } from "@/lib/utils/query";

function Home() {
  const lang = useLang();

  return (
    <>
      <Head>
          <title>{lang.get('metaTitle')}</title>
          <meta name="description" content={lang.get('metaDescription')} />
      </Head>

      <LayoutMain>
        <HomeTitle />
        <UrlShortForm />
        <UtmInfoSmall />
      </LayoutMain>
    </>
  );
}

interface Props {
  user?: UserClient;
}

export default function Index({ user }: Props) {
  return (
    <AppProvider user={user}>
      <Home />
    </AppProvider>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context)
  const user = await getCurrentUserFromSession(supabase);
  return { props: { user } };
}