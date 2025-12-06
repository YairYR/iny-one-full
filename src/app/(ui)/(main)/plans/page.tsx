import PricingCards from "@/components/PricingCards";
import type React from "react";
import { useTranslations } from "next-intl";

export default function PlansPage() {
  const t = useTranslations("PlansPage");

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-bold mb-10 text-gray-800">{t('title')}</h2>
      <PricingCards logged={false} />
    </div>
  )
}