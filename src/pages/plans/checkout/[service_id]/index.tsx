import LayoutMain from "@/components/layouts/LayoutMain";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayButtons from "@/components/Paypal/PayButtons";
import { GetServerSidePropsContext } from "next";
import { getCurrentUser, getPlanById } from "@/lib/utils/query";
import { Plan } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { AppProvider } from "@/contexts/app.context";

interface Props {
  plan: Plan;
  user: never;
}

export default function PlanCheckoutPage({ plan, user }: Props) {
  return (
    <AppProvider user={user}>
      <LayoutMain>
        <h1>{plan.name}</h1>
        <h3>${plan.price} {plan.currency}</h3>
        <div className="h-screen bg-slate-900 flex items-center justify-center">
          <PayPalScriptProvider
            options={{
              clientId: 'ASaLNO6086Wfq7S3at7exagKgZAYO0Bf12HkUceyb-mNmtU2m5l8W883o_EqGn84e3X_c8KAHcI-dKgU',
              crossorigin: 'anonymous',
              components: "buttons",
              dataSdkIntegrationSource: 'developer-studio',
              environment: 'sandbox',
              debug: true,
              currency: 'USD',
            }}>
            <PayButtons planId={plan.id} />
          </PayPalScriptProvider>
        </div>
      </LayoutMain>
    </AppProvider>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context)
  const { user, raw } = await getCurrentUser(supabase);

  if (!user) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  const { service_id } = context.query;
  const plan = await getPlanById(service_id as string);

  if(!plan) {
    return {
      redirect: {
        destination: '/plans',
        permanent: false,
      },
    }
  }

  return {
    props: {
      plan: plan.data,
      user: user,
    }
  }
}
