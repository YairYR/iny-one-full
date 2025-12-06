import React from "react";
import HomeTitle from "@/components/HomeTitle";
import UrlShortForm from "@/features/short_links/components/UrlShortForm";
import UtmInfoSmall from "@/components/UtmInfoSmall";
import SubscriptionUpgrade from "@/components/SubscriptionUpgrade";

export default function HomePage() {
  // TODO: get user plan
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