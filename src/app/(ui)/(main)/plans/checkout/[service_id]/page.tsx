import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayButtons from "@/features/payments/components/Paypal/PayButtons";
import { getPlanById } from "@/lib/utils/query";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/data/user-dto";

interface Props {
  params: Promise<{ service_id: string }>;
}

export default async function PlanCheckoutPage({ params }: Readonly<Props>) {
  const { service_id } = await params;

  const logged = await isLoggedIn();
  if(!logged) {
    return redirect('/auth/login');
  }

  const { data: plan, error } = await getPlanById(service_id);

  if(!plan || error) {
    return redirect('/plans');
  }

  return (
    <>
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
    </>
  )
}
