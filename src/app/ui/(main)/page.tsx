import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import React from "react";
import HomeTitle from "@/components/HomeTitle";
import UrlShortForm from "@/features/short_links/components/UrlShortForm";
import UtmInfoSmall from "@/components/UtmInfoSmall";
import SubscriptionUpgrade from "@/components/SubscriptionUpgrade";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Head");
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      url: "/",
      images: ["/og-image.png"],
    },
    twitter: {
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function HomePage() {
  const hasPlan = true;

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <HomeTitle />
        <UrlShortForm />
        <UtmInfoSmall />
      </div>
      <SubscriptionUpgrade hidden={hasPlan} />
    </>
  );
}
