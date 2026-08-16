import React from "react";
import { CheckIcon } from "lucide-react";
import clsx from "clsx";
import { PayPalSubscriptionButton, OnApproveDataSubscriptions, OnCancelDataOneTimePayments, OnErrorData, OnCompleteData } from "@paypal/react-paypal-js/sdk-v6";
import {ErrorResponse, SuccessResponse} from "@/lib/types/api";
import {ERROR} from "@/lib/api/error-codes";
import {useRouter} from "next/navigation";
import {ROUTES} from "@/lib/routes";
import {addCookie, addToLocalStorage, getFromLocalStorage} from "@/lib/utils/localstorage";

export interface IPricingCard {
  plan: {
    id: string|null;
    name: string;
    price: string;
    period?: string;
    features: string[];
    color: string;
    highlight?: boolean;
    disabled?: boolean;
    button?: string;
  };
  onClick: (event: React.MouseEvent<HTMLButtonElement>, planId: string|null) => void;
}

export default function PricingCard({ plan, onClick }: Readonly<IPricingCard>) {
  const router = useRouter();
  const isDisabled = Boolean(plan.disabled);

  const createSubscription = async (planId: string) => {
    const resp: SuccessResponse<{ subscriptionId: string }>|ErrorResponse = await fetch('/api/v1/subscription', {
      method: "POST",
      body: JSON.stringify({
        planId: planId,
      })
    }).then((res) => res.json());

    if (resp.ok) {
      return {
        subscriptionId: resp.data.subscriptionId,
      }
    }

    if (resp.error.code === ERROR.SESSION_NOT_FOUND) {
      addCookie('_redirect_to', `${ROUTES.PLANS}#plan=${planId}`);
      return router.push(ROUTES.LOGIN);
    }

    //alert('Error creating new subscription');
  }

  const onApprove = async (data: OnApproveDataSubscriptions) => {
    console.log("onApprove", data);

    const resp: SuccessResponse<{ subscriptionId: string }>|ErrorResponse = await fetch('/api/v1/subscription/capture', {
      method: "PATCH",
      body: JSON.stringify({
        id: data.subscriptionId,
      })
    }).then((res) => res.json());

    // TODO: validar respuesta y sesión
    if (resp.ok) {
      alert("Subscription was successfully approved!");
      return;
    }

    alert("Subscription was not approved! Try again!");
  }

  const onCancel = async (data: OnCancelDataOneTimePayments) => {
    console.log("onCancel", data);
  }

  const onError = async (data: OnErrorData) => {
    console.error("onError", data);
  }

  const onComplete = async (data: OnCompleteData) => {
    console.log("Subscription flow completed", data)
  }

  return (
    <div
      key={plan.id ?? 'pricing-card-0'}
      id={plan.id ?? 'pricing-card-0'}
      className={`border rounded-2xl p-8 flex flex-col items-center transition-all duration-300 ${plan.color}`}
    >
      <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
      <p className="text-4xl font-bold mb-2">{plan.price}</p>
      <p className="text-gray-500 mb-6">{plan.period}</p>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-gray-600">
            <CheckIcon className="w-5 h-5 text-green-500" />
            {feature}
          </li>
        ))}
      </ul>

      {plan.id == null && (
          <button
            onClick={(e) => onClick(e, plan.id)}
            disabled={isDisabled}
            className={clsx(
                'w-full py-2 rounded-lg font-medium transition-colors mt-auto cursor-not-allowed',
                (!isDisabled) && 'cursor-pointer',
                plan.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-800 text-white hover:bg-gray-900"
            )}
        >
          {plan.button ?? 'Choise plan'}
        </button>
      )}

      {plan.id && typeof plan.id === 'string' && (
          <PayPalSubscriptionButton
              // @ts-expect-error Create subscription or redirect to log in
              createSubscription={() => createSubscription(plan.id!)}
              onApprove={onApprove}
              onCancel={onCancel}
              onError={onError}
              onComplete={onComplete}
          />
      )}
    </div>
  );
}
