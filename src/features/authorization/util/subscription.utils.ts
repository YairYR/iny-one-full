import { Database } from "@/lib/types/db.types";

type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"]

type Subscription = {
    id: string;
    status: SubscriptionStatus | null;
    start_date: string | null;
    end_date: string | null;
    service_id: string;
};

export function isSubscriptionEffective(
    subscription: Subscription | null,
    now = new Date(),
): boolean {
    if (!subscription) {
        return false;
    }

    const startDate = subscription.start_date
        ? new Date(subscription.start_date)
        : null;

    const endDate = subscription.end_date
        ? new Date(subscription.end_date)
        : null;

    if (startDate && now < startDate) {
        return false;
    }

    if (endDate && now >= endDate) {
        return false;
    }

    switch (subscription.status) {
        case "ACTIVE":
        //case "trialing":
        //case "past_due":
            return true;

        case "CANCELLED":
            return endDate ? now < endDate : false;

        case "EXPIRED":
            return false;

        default:
            return false;
    }
}

