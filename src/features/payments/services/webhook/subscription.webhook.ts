import { WebhookEventPaypal, PaypalEventType } from "@/lib/types";
import { Enums } from "@/lib/types/db.types";
import { getWebhookRepository } from "@/infra/db/webhook.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { SubscriptionStatus } from "@/features/authorization/util/subscription.utils";
import { SubscriptionRepository } from "@/infra/db/subscription.repository";
import logger from "@/lib/logger";

const log = logger.child({ service: 'payments', module: 'webhook', type: 'subscription' });

export async function proccessSubscriptionWebhook(webhookId: string, payload: WebhookEventPaypal) {
  const resourceId: string|undefined = payload.resource?.id as string;
  if (typeof resourceId !== 'string') return false;

  const newSubscriptionStatus = PaypalEventTypeSubscription[payload.event_type];
  const checkStatus: SubscriptionStatus[] = [];
  if (newSubscriptionStatus === 'ACTIVE') {
    checkStatus.push('APPROVAL_PENDING', 'APPROVED');
  }

  const responseUpdate = await SubscriptionRepository.updateByExternalId(resourceId, 'paypal', { status: newSubscriptionStatus }, checkStatus);
  if (responseUpdate.error || !responseUpdate.data) {
    log.error(responseUpdate.error, 'Error updating subscription status for resourceId: %s, newStatus: %s', resourceId, newSubscriptionStatus);
    return false;
  }

  const webhookRepo = getWebhookRepository(supabase_service);
  await webhookRepo.setProcessed(webhookId);

  // TODO: Actualizar el estado de la orden asociada a la suscripción según el nuevo estado (ACTIVE -> completed, EXPIRED -> ???, CANCELLED/SUSPENDED -> cancelled)

  return true;
}

export function isSubscriptionEvent(payload: WebhookEventPaypal) {
  return [
    PaypalEventType.SUBSCRIPTION_ACTIVATED,
    PaypalEventType.SUBSCRIPTION_EXPIRED,
    PaypalEventType.SUBSCRIPTION_CANCELLED,
    PaypalEventType.SUBSCRIPTION_SUSPENDED,
    // @ts-expect-error solo es necesario comparar algunos eventos, no todos los eventos de paypal
  ].includes(payload.event_type);
}

export const PaypalEventTypeSubscription: Record<string, Enums<'subscription_status'>> = {
  [PaypalEventType.SUBSCRIPTION_ACTIVATED]: 'ACTIVE',
  [PaypalEventType.SUBSCRIPTION_EXPIRED]: 'EXPIRED',
  [PaypalEventType.SUBSCRIPTION_CANCELLED]: 'CANCELLED',
  [PaypalEventType.SUBSCRIPTION_SUSPENDED]: 'SUSPENDED',
} as const;
