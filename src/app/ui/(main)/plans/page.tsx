import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import PricingCards from "@/components/PricingCards";
import { useTranslations } from "next-intl";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("PlansPage");

  const isEs = locale.startsWith("es");
  const title = isEs ? `Planes – iny.one` : `Pricing Plans – iny.one`;
  const description = isEs
    ? "Compara los planes de iny.one y revisa qué funciones de acortamiento, UTM y analítica estarán disponibles."
    : "Compare iny.one plans and see which shortening, UTM, and analytics features are available.";

  return {
    title,
    description,
    alternates: {
      canonical: "/plans",
    },
    openGraph: {
      title,
      description,
      url: "/plans",
      images: ["/og-image.png"],
    },
    twitter: {
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function PlansPage() {
  const t = useTranslations("PlansPage");

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-bold mb-10 text-gray-800">{t("title")}</h2>
      <PricingCards logged={false} />
    </div>
  );
}
