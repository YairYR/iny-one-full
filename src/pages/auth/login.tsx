import LayoutMain from '@/components/layouts/LayoutMain';
import LoginForm from "@/components/LoginForm";
import type { GetServerSidePropsContext } from "next";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/lib/utils/query";

export default function LoginPage() {
  return (
    <LayoutMain>
      <LoginForm />
    </LayoutMain>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context)
  const { user } = await getCurrentUser(supabase);

  if (user) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return { props: {} };
}