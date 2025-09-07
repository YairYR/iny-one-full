import { GetServerSidePropsContext } from "next";
import { createClient } from "@/utils/supabase/server";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);
  await supabase.auth.signOut();

  return {
    redirect: {
      destination: "/",
      permanent: false,
    }
  }
}

export default function Logout() {
  return null;
}
