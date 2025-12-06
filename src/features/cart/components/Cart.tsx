'use client';

import PayButtons from "@/features/payments/components/Paypal/PayButtons";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Plan } from "@/lib/types";

interface Props {
  plan: Plan;
}

export default function Cart({ plan }: Readonly<Props>) {
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