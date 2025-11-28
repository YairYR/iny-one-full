import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayButtons from "@/features/payments/components/Paypal/PayButtons";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/data/dto/user-dto";
import { createServicesRepository } from "@/infra/db/services.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { getFromLocalStorage, getFromSessionStorage } from "@/utils/localstorage";

export default async function PlanCheckoutPage() {
  const logged = await isLoggedIn();
  if(!logged) {
    return redirect('/auth/login?next=/cart');
  }

  const service_id = getFromSessionStorage("cart") ?? getFromLocalStorage("cart");
  if(!service_id) {
    return redirect('/plans');
  }

  const servicesRepo = createServicesRepository(supabase_service);
  const { data: plan, error } = await servicesRepo.getPlanById(service_id);

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
