import { WebhookEventPaypal } from "@/lib/types";
import { createWebhook, updateWebhook } from "@/lib/utils/query";
import { after } from "next/server";
import { SubscriptionRepository } from "@/infra/db/subscription.repository";

export async function processPaypalWebhook(payload: WebhookEventPaypal) {
  const { data } = await createWebhook({
    event_type: payload.event_type,
    gateway: 'paypal',
    external_event_id: payload.id,
    payload: payload,
    processed: false,
    summary: payload.summary,
    resource_type: payload.resource_type,
  });

  const webhookId = data?.[0].id;

  after(async () => {
    if(!webhookId) return;
    switch (payload.event_type) {
      case PaypalEventType.SUBSCRIPTION_EXPIRED:
        await subscriptionExpired(payload, webhookId);
        break;
    }
  });
}

async function subscriptionExpired(payload: WebhookEventPaypal, webhookId: string) {
  const subscriptionId: string|undefined = payload.resource?.id;
  if(subscriptionId) {
    await SubscriptionRepository.updateByExternalId(subscriptionId, 'paypal', { status: 'EXPIRED' });
    await updateWebhook(webhookId, true);
  }
}

enum PaypalEventType {
  PRODUCT_CREATED = "CATALOG.PRODUCT.CREATED",
  PRODUCT_UPDATED = "CATALOG.PRODUCT.UPDATED",

  // A payment is made on a subscription.
  PAYMENT_COMPLETED = "PAYMENT.SALE.COMPLETED",
  // A merchant refunds a sale.
  PAYMENT_REFUNDED = "PAYMENT.SALE.REFUNDED",
  // A payment is reversed on a subscription.
  PAYMENT_REVERSED = "PAYMENT.SALE.REVERSED",

  PLAN_CREATED = "BILLING.PLAN.CREATED",
  PLAN_UPDATED = "BILLING.PLAN.UPDATED",
  PLAN_ACTIVATED = "BILLING.PLAN.ACTIVATED",
  PLAN_DEACTIVATED = "BILLING.PLAN.DEACTIVATED",
  // A price change for the plan is activated.
  PLAN_PRICING_CHANGE = "BILLING.PLAN.PRICING-CHANGE.ACTIVATED",

  SUBSCRIPTION_CREATED = "BILLING.SUBSCRIPTION.CREATED",
  SUBSCRIPTION_ACTIVATED = "BILLING.SUBSCRIPTION.ACTIVATED",
  SUBSCRIPTION_UPDATED = "BILLING.SUBSCRIPTION.UPDATED",
  SUBSCRIPTION_EXPIRED = "BILLING.SUBSCRIPTION.EXPIRED",
  SUBSCRIPTION_CANCELLED = "BILLING.SUBSCRIPTION.CANCELLED",
  SUBSCRIPTION_SUSPENDED = "BILLING.SUBSCRIPTION.SUSPENDED",
  // Payment failed on subscription.
  SUBSCRIPTION_PAYMENT_FAILED = "BILLING.SUBSCRIPTION.PAYMENT.FAILED"
}
