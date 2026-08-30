import { PaypalEventType, WebhookEventPaypal } from "@/lib/types";
import { after } from "next/server";
import { SubscriptionRepository } from "@/infra/db/subscription.repository";
import { getWebhookRepository } from "@/infra/db/webhook.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { Enums } from "@/lib/types/db.types";

/**
 * TODO: validar si ya existe el "external_event_id" + "gateway"
 * @param payload
 */
export async function processPaypalWebhook(payload: WebhookEventPaypal) {
  const webhookRepo = getWebhookRepository(supabase_service);
  const { data } = await webhookRepo.create({
    event_type: payload.event_type,
    gateway: 'paypal',
    external_event_id: payload.id,
    payload: payload,
    processed_at: null,
    summary: payload.summary,
    resource_type: payload.resource_type,
  });

  const webhookId = data?.[0].id;

  after(async () => {
    if(!webhookId) return;
    const resourceId: string|undefined = payload.resource?.id;

    if(isSubscriptionEvent(payload)) {
      const newStatus = PaypalEventTypeSubscription[payload.event_type];
      if(resourceId) {
        await SubscriptionRepository.updateByExternalId(resourceId, 'paypal', { status: newStatus });
        await webhookRepo.setProcessed(webhookId);
      }
    }

    // if (isPaymentEvent(payload)) {
    //   // TODO: Implementar lógica para eventos de pago
    // }
  });
}

function isSubscriptionEvent(payload: WebhookEventPaypal) {
  return [
    PaypalEventType.SUBSCRIPTION_ACTIVATED,
    PaypalEventType.SUBSCRIPTION_EXPIRED,
    PaypalEventType.SUBSCRIPTION_CANCELLED,
    PaypalEventType.SUBSCRIPTION_SUSPENDED,
    // @ts-expect-error solo es importante comparar el string
  ].includes(payload.event_type);
}

// Se comenta por ahora porque no se está manejando eventos de pago
// function isPaymentEvent(payload: WebhookEventPaypal) {
//   return [
//     PaypalEventType.PAYMENT_COMPLETED,
//     PaypalEventType.PAYMENT_REFUNDED,
//     PaypalEventType.PAYMENT_REVERSED,
//   ].includes(payload.event_type);
// }

const PaypalEventTypeSubscription: Record<string, Enums<'subscription_status'>> = {
  [PaypalEventType.SUBSCRIPTION_ACTIVATED]: 'ACTIVE',
  [PaypalEventType.SUBSCRIPTION_EXPIRED]: 'EXPIRED',
  [PaypalEventType.SUBSCRIPTION_CANCELLED]: 'CANCELLED',
  [PaypalEventType.SUBSCRIPTION_SUSPENDED]: 'SUSPENDED',
} as const;
