'use client';

import { DISPATCH_ACTION, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { LoadingSpinner } from "@/components/Spinner";
import { PayPalButtonCreateSubscription, PayPalButtonOnApprove } from "@paypal/paypal-js";
import { useEffect } from "react";

interface Props {
  planId: string;
}

export default function PayButtons({ planId }: Readonly<Props>) {
  const [state, dispatch] = usePayPalScriptReducer();
  const { isPending } = state;

  useEffect(() => {
    dispatch({
      type: DISPATCH_ACTION.RESET_OPTIONS,
      value: {
        ...state.options,
        vault: true,
        intent: "subscription",
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createSubscription: PayPalButtonCreateSubscription = async (data, actions) => {
    console.log('createSubscription click!', { data, actions });
    return fetch("/api/checkout/paypal/create-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart: [
          {
            id: planId,
            quantity: 1,
          },
        ],
      }),
    })
      .then((response) => response.json())
      .then((order) => order.data.id);
  }

  const onApprove: PayPalButtonOnApprove = async (data) => {
    return fetch("/api/checkout/paypal/capture-subscription", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: data.subscriptionID
      })
    })
      .then((response) => response.json())
      .then((subscriptionData) => {
        const name = subscriptionData.data.suscriber.name.given_name;
        alert(`Transaction completed by ${name}`);
      });
  }

  return (
    <>
      {isPending
        ? <LoadingSpinner className="text-blue-500" />
        : null}
      <PayPalButtons
        style={{ layout: 'vertical', color: 'silver' }}
        createSubscription={createSubscription}
        onApprove={onApprove}
        appSwitchWhenAvailable={false}
      />
    </>
  )
}