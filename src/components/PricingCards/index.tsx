'use client';

import React from "react";
import PricingCard from "@/components/PricingCards/PricingCard";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import {UserPlanSummary} from "@/lib/types";
import {useLocale} from "next-intl";
import {
  OnApproveDataSubscriptions,
  OnCancelDataOneTimePayments,
  OnCompleteData,
  OnErrorData
} from "@paypal/react-paypal-js/sdk-v6";
import {ErrorResponse, SuccessResponse} from "@/lib/types/api";
import {ERROR} from "@/lib/api/error-codes";
import {addCookie} from "@/lib/utils/localstorage";

interface Props {
  logged: boolean;
  plan: UserPlanSummary | null;
}

/**
 * TODO: Permitir cambiar de plan
 */

const planInfo = {
  es: {
    anonymous: {
      name: "Anónimo (Sin Cuenta)",
      period: "",
      features: [
        "5 enlaces al mes",
        "utm_source / utm_medium / utm_campaign",
        "código QR gratis por enlace",
        "Los enlaces expiran a los 180 días"
      ],
    },
    free: {
      name: "Free",
      period: "/mes",
      features: [
        "50 enlaces al mes que no expiran",
        "Más el panel completo:",
        "clics totales y únicos",
        "Países",
        "Dispositivos",
        "Navegadores y referentes",
      ],
      button: 'Crear Cuenta'
    },
    starter: {
      name: "Básico",
      period: "/mes",
      features: [
        "Características del plan gratuito",
        "1.000 enlaces al mes",
        "2 parámetros UTM adicionales: utm_content y utm_term",
        "Panel mejorado",
        "Mayor control sobre tus enlaces",
        "Características de acceso anticipado"
      ],
    }
  },
  en: {
    anonymous: {
      name: "Anonymous (no account)",
      period: "",
      features: [
        "5 links per month",
        "utm_source / utm_medium / utm_campaign",
        "free QR code per link",
        "Links expire after 180 days"
      ],
    },
    free: {
      name: "Free",
      period: "/month",
      features: [
        "50 links per month that never expire",
        "Plus the full dashboard: total and unique clicks",
        "Top countries",
        "Devices",
        "Browsers and referrers",
      ],
      button: 'Create Account'
    },
    starter: {
      name: "Basic",
      period: "/month",
      features: [
        "Free plan features",
        "1,000 links per month",
        "2 extra UTM parameters: utm_content and utm_term",
        "Enhanced dashboard",
        "More control over your links",
        "Early Access Features"
      ],
    }
  }
};

export default function PricingCards({ logged, plan }: Readonly<Props>) {
  const locale = useLocale() as 'es' | 'en';
  const router = useRouter();
  const plans = [
    {
      id: null,
      name: planInfo[locale].free.name,
      price: "$0",
      period: planInfo[locale].free.period,
      features: planInfo[locale].free.features,
      color: "border-gray-300 text-gray-700 bg-blue-50 hover:border-gray-400",
      disabled: logged,
      button: 'Create Account',
      onClick: function() {
        if (!logged) {
          router.push(ROUTES.LOGIN);
        }
      }
    },
    {
      id: "fa88cc5f-4da5-464d-b571-eb690c7c2a31",
      name: planInfo[locale].starter.name,
      price: "$5",
      period: planInfo[locale].starter.period,
      features: planInfo[locale].starter.features,
      color: "border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100 shadow-md",
      highlight: true,
      disabled: Boolean(plan && !plan.isFree),
    },
    // {
    //   id: "62f7de06-6bfc-4438-aa3d-e323e51ea0c4",
    //   name: "Empresarial",
    //   price: "$20.00",
    //   period: "/mes",
    //   features: [
    //     "Usuarios ilimitados",
    //     "1 TB de almacenamiento",
    //     "Soporte dedicado 24/7",
    //     "API personalizada",
    //   ],
    //   color: "border-gray-400 text-gray-800 hover:border-gray-500",
    // },
  ];

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

    if (resp.error.code === ERROR.PLAN_ALREADY) {
      return router.refresh();
    }

    alert('Error creating new subscription');
  }

  const onApprove = async (data: OnApproveDataSubscriptions) => {
    const resp: SuccessResponse<{ subscriptionId: string }>|ErrorResponse = await fetch('/api/v1/subscription/approve', {
      method: "PATCH",
      body: JSON.stringify({
        id: data.subscriptionId,
      })
    }).then((res) => res.json());

    if (resp.ok) {
      return router.push(ROUTES.DASHBOARD);
    }

    alert("Subscription was not approved! Try again!");
  }

  const onCancel = async (data: OnCancelDataOneTimePayments) => {
  }

  const onError = async (data: OnErrorData) => {
    console.error("onError", data);
  }

  const onComplete = async (data: OnCompleteData) => {
    console.log("Subscription flow completed", data)
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
      {plans.map((item) => (
        <PricingCard
            key={`plan-${item.name}`}
            plan={item}
            // @ts-expect-error Create subscription or redirect to log in
            createSubscription={createSubscription}
            onApprove={onApprove}
            onCancel={onCancel}
            onError={onError}
            onComplete={onComplete}
        />
      ))}
    </div>
  );
}
