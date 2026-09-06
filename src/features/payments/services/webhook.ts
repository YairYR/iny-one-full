import { WebhookEventPaypal } from "@/lib/types";
import { getWebhookRepository } from "@/infra/db/webhook.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { logger } from "@/lib/logger";
import { ServiceError } from "@/lib/api/errors";
import {
  isSubscriptionEvent,
  proccessSubscriptionWebhook
} from "@/features/payments/services/webhook/subscription.webhook";

const log = logger.child({ service: 'payments', module: 'webhook' });

/**
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
      log.warn({ error, id: payload.id }, 'Webhook record already exists, skipping processing');
      return;
    }

    log.error({ error, id: payload.id }, 'Error creating webhook record');
    throw new ServiceError('Error creating webhook record');
  }

  log.info({ id: payload.id }, 'Webhook record created successfully');

  const webhookId = data[0].id;
  if(!webhookId) {
    log.error({ id: payload.id }, 'Webhook record ID is undefined after creation');
    throw new ServiceError('Webhook record ID is undefined after creation');
  }

  let processedWebhook = false;
  if(isSubscriptionEvent(payload)) {
    processedWebhook = await proccessSubscriptionWebhook(webhookId, payload);
  }

  // if (isPaymentEvent(payload)) {
  //   // TODO: Implementar lógica para eventos de pago
  // }

  if (processedWebhook) {
    log.info({ id: payload.id, event_type: payload.event_type }, 'Webhook processed successfully');
  }
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
