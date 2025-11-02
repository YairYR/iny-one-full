'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import PayButtons from "@/features/payments/components/Paypal/PayButtons";

export default function PayPage() {
  const planId = '39314c6e-0178-a8e7-02a2-f5397a8bb8d4';

  return (
    <div className="h-screen bg-slate-900 flex items-center justify-center">
      <PayPalScriptProvider
        options={{
          clientId: 'test',
          // clientId: 'ASaLNO6086Wfq7S3at7exagKgZAYO0Bf12HkUceyb-mNmtU2m5l8W883o_EqGn84e3X_c8KAHcI-dKgU',
          crossorigin: 'use-credentials',
          // crossorigin: 'anonymous',
          components: "buttons",
          dataSdkIntegrationSource: 'developer-studio',
          environment: 'sandbox',
          debug: true,
          currency: 'USD',
          intent: 'subscription',
          vault: true,
          // dataJsSdkLibrary: 'hola',
          // dataUid: 'ABC',
          // enableFunding: ['wenas']
        }}>
        <PayButtons planId={planId} />
      </PayPalScriptProvider>
    </div>
  )
}
