'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import PayButtons from "@/app/pay/components/PayButtons";

export default function PayPage() {
  return (
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
        <PayButtons />
      </PayPalScriptProvider>
    </div>
  )
}
