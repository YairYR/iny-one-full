import type { Metadata } from "next";
import type React from "react";
import {PAYPAL_CONFIG} from "@/lib/paypal-client";
import {PayPalProvider} from "@paypal/react-paypal-js/sdk-v6";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <PayPalProvider {...PAYPAL_CONFIG}>
        {children}
      </PayPalProvider>
  )
}
