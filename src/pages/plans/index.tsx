import LayoutMain from "@/components/layouts/LayoutMain";
import React from "react";
import PricingCards from "@/components/PricingCards";
import { AppProvider } from "@/contexts/app.context";
import { GetServerSidePropsContext } from "next";
import { createClient } from "@/utils/supabase/server";

interface Props {
  user: never;
}

export default function PlansPage({ user }: Props) {
  return (
    <AppProvider user={user}>
      <LayoutMain>
        <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
          <h2 className="text-3xl font-bold mb-10 text-gray-800">
            Planes de Suscripción
          </h2>
          <PricingCards />
        </div>
      </LayoutMain>
    </AppProvider>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // const plans = await getPlans();
  const supabase = createClient(context);
  const { data } = await supabase.auth.getSession();

  const user = data.session?.user;

  return {
    props: {
      // plans: plans.data
      user,
    }
  }
}