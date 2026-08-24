import PricingCards from "@/components/PricingCards";
import type React from "react";
import {getUserPlan, isLoggedIn} from "@/data/dto/user-dto";

interface Props {
  hidden: boolean;
}

export default async function SubscriptionUpgrade({ hidden }: Readonly<Props>) {
  const logged = await isLoggedIn();
  const plan = await getUserPlan();

  if(!logged || hidden) {
    return null;
  }

  return (
    <div className="m-8 mb-6" id="subscriptions">
      <PricingCards logged={logged} plan={plan} />
    </div>
  )
}