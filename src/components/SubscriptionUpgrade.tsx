import PricingCards from "@/components/PricingCards";
import type React from "react";
import { isLoggedIn } from "@/data/dto/user-dto";

interface Props {
  hidden: boolean;
}

export default async function SubscriptionUpgrade({ hidden }: Readonly<Props>) {
  const logged = await isLoggedIn();

  if(!logged || hidden) {
    return null;
  }

  return (
    <div className="m-8 mb-6" id="subscriptions">
      <PricingCards logged={logged} />
    </div>
  )
}