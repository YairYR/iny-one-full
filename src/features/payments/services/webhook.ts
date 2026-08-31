import { PaypalEventType, WebhookEventPaypal } from "@/lib/types";
import { SubscriptionRepository } from "@/infra/db/subscription.repository";
import { getWebhookRepository } from "@/infra/db/webhook.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { Enums } from "@/lib/types/db.types";
import { logger } from "@/lib/logger";
import { ServiceError } from "@/lib/api/errors";

const log = logger.child({ service: 'payments', module: 'webhook' });

/**
 * TODO: validar si ya existe el "external_event_id" + "gateway"
 * @param payload
 */
export async function processPaypalWebhook(payload: WebhookEventPaypal) {
  const webhookRepo = getWebhookRepository(supabase_service);
  const { data, error } = await webhookRepo.create({
    event_type: payload.event_type,
    gateway: 'paypal',
    external_event_id: payload.id,
    payload: payload,
    processed_at: null,
    summary: payload.summary,
    resource_type: payload.resource_type,
  });

  if (error) {
    if (/unique constraint/i.test(error.message)) {
      log.warn('Webhook record already exists, skipping processing:', { error, id: payload.id });
      return;
    }

    log.error('Error creating webhook record:', { error });
    return;
  }

  log.info('Webhook record created successfully:', { id: payload.id });

  const webhookId = data[0].id;
  if(!webhookId) {
    log.error('Webhook record ID is undefined after creation:', { id: payload.id });
    throw new ServiceError('Webhook record ID is undefined after creation');
  }
  const resourceId: string|undefined = payload.resource?.id;

  let processedWebhook = false;
  if(isSubscriptionEvent(payload)) {
    const newSubscriptionStatus = PaypalEventTypeSubscription[payload.event_type];
    if(resourceId) {
      await SubscriptionRepository.updateByExternalId(resourceId, 'paypal', { status: newSubscriptionStatus });
      await webhookRepo.setProcessed(webhookId);
      // TODO: Actualizar el estado de la orden asociada a la suscripción según el nuevo estado (ACTIVE -> completed, EXPIRED -> ???, CANCELLED/SUSPENDED -> cancelled)
      processedWebhook = true;
    }
  }

  // if (isPaymentEvent(payload)) {
  //   // TODO: Implementar lógica para eventos de pago
  // }

  if (processedWebhook) {
    log.info('Webhook processed successfully:', { id: payload.id, event_type: payload.event_type });
  }
}

function isSubscriptionEvent(payload: WebhookEventPaypal) {
  return [
    PaypalEventType.SUBSCRIPTION_ACTIVATED,
    PaypalEventType.SUBSCRIPTION_EXPIRED,
    PaypalEventType.SUBSCRIPTION_CANCELLED,
    PaypalEventType.SUBSCRIPTION_SUSPENDED,
    // @ts-expect-error solo es necesario comparar algunos eventos, no todos los eventos de paypal
  ].includes(payload.event_type);
}

// Se comenta por ahora porque no se está manejando eventos de pago
// function isPaymentEvent(payload: WebhookEventPaypal) {
//   return [
//     PaypalEventType.PAYMENT_COMPLETED,
//     PaypalEventType.PAYMENT_REFUNDED,
//     PaypalEventType.PAYMENT_REVERSED,
//     PaypalEventType.SUBSCRIPTION_PAYMENT_FAILED
//     // @ts-expect-error solo es necesario comparar algunos eventos, no todos los eventos de paypal
//   ].includes(payload.event_type);
// }

const PaypalEventTypeSubscription: Record<string, Enums<'subscription_status'>> = {
  [PaypalEventType.SUBSCRIPTION_ACTIVATED]: 'ACTIVE',
  [PaypalEventType.SUBSCRIPTION_EXPIRED]: 'EXPIRED',
  [PaypalEventType.SUBSCRIPTION_CANCELLED]: 'CANCELLED',
  [PaypalEventType.SUBSCRIPTION_SUSPENDED]: 'SUSPENDED',
} as const;
