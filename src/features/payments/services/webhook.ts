import { WebhookEventPaypal } from "@/lib/types";
import { after } from "next/server";
import { SubscriptionRepository, type SubscriptionStatus } from "@/infra/db/subscription.repository";
import { getWebhookRepository } from "@/infra/db/webhook.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { isUniqueViolation } from "@/infra/db/db-errors";
import { logger } from "@/lib/logger";

const log = logger.child({ service: 'paypal-webhook' });

export enum PaypalEventType {
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

/**
 * Estado al que lleva cada evento de suscripción.
 *
 * Antes sólo se atendía `SUBSCRIPTION_EXPIRED`: una cancelación hecha desde
 * PayPal se guardaba y no cambiaba nada, así que el usuario conservaba su plan
 * indefinidamente. Los eventos que no aparecen aquí se registran y no cambian
 * estado, que es distinto de ignorarlos en silencio.
 */
const EVENT_TO_STATUS: Partial<Record<PaypalEventType, SubscriptionStatus>> = {
  [PaypalEventType.SUBSCRIPTION_ACTIVATED]: 'ACTIVE',
  [PaypalEventType.SUBSCRIPTION_EXPIRED]: 'EXPIRED',
  [PaypalEventType.SUBSCRIPTION_CANCELLED]: 'CANCELLED',
  [PaypalEventType.SUBSCRIPTION_SUSPENDED]: 'SUSPENDED',
};

/**
 * Registra el evento y aplica su efecto sobre la suscripción.
 *
 * La idempotencia se apoya en la restricción única de
 * `webhook_events.external_event_id`: PayPal reintenta los eventos, y un
 * reintento tiene que ser inocuo. Si el insert choca, el evento ya se procesó
 * y se sale sin hacer nada.
 */
export async function processPaypalWebhook(payload: WebhookEventPaypal) {
  const webhookRepo = getWebhookRepository(supabase_service);

  const { data, error } = await webhookRepo.create({
    event_type: payload.event_type,
    gateway: 'paypal',
    external_event_id: payload.id,
    payload: payload,
    processed: false,
    summary: payload.summary,
    resource_type: payload.resource_type,
  });

  if (error) {
    if (isUniqueViolation(error)) {
      log.info('duplicate webhook ignored', { event_id: payload.id, event_type: payload.event_type });
      return;
    }
    log.error('could not record webhook event', { event_id: payload.id, error });
    throw new Error('could not record webhook event');
  }

  // `data?.[0].id` reventaba cuando el insert no devolvía filas: el
  // encadenamiento opcional tiene que cubrir también el índice.
  const webhookId = data?.[0]?.id;

  if (!webhookId) {
    log.error('webhook insert returned no rows', { event_id: payload.id });
    return;
  }

  after(async () => {
    const status = EVENT_TO_STATUS[payload.event_type as PaypalEventType];

    if (!status) {
      log.info('webhook stored without state change', {
        event_id: payload.id,
        event_type: payload.event_type,
      });
      return;
    }

    const subscriptionId: string | undefined = payload.resource?.id;

    if (!subscriptionId) {
      log.warn('subscription event without resource id', { event_id: payload.id });
      return;
    }

    const { error: updateError } = await SubscriptionRepository.updateByExternalId(
      subscriptionId,
      'paypal',
      { status },
    );

    if (updateError) {
      log.error('could not apply webhook to subscription', {
        event_id: payload.id,
        external_subscription_id: subscriptionId,
        status,
        error: updateError,
      });
      return;
    }

    await webhookRepo.setProcessed(webhookId, true);
    log.info('webhook applied', { event_id: payload.id, event_type: payload.event_type, status });
  });
}
