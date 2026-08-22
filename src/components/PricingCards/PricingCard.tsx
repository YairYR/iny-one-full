import React from "react";
import { CheckIcon } from "lucide-react";
import clsx from "clsx";
import { PayPalSubscriptionButton, OnApproveDataSubscriptions } from "@paypal/react-paypal-js/sdk-v6";

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
    onClick?: () => void;
  };
  createSubscription: (planId: string) => Promise<{ subscriptionId: string; }>;
  onApprove: (data: OnApproveDataSubscriptions) => Promise<void>;
}

export default function PricingCard({ plan, createSubscription, onApprove }: Readonly<IPricingCard>) {
  const isDisabled = Boolean(plan.disabled);

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
            onClick={plan.onClick}
            disabled={isDisabled}
            className={clsx(
                'w-full py-2 rounded-lg font-medium transition-colors mt-auto cursor-not-allowed',
                (!isDisabled) && 'cursor-pointer',
                isDisabled && 'disabled:opacity-50 disabled:pointer-events-none',
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
              createSubscription={() => createSubscription(plan.id!)}
              onApprove={onApprove}
              disabled={isDisabled}
          />
      )}
    </div>
  );
}
