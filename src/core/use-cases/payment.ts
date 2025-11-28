import { BillingRepository } from "@/infra/payments/billing.repository";
import { SubscriptionRepository } from "@/infra/db/subscription.repository";
import { getServiceRepository } from "@/infra/db/service.repository";
import { User } from "@supabase/auth-js";
import { retry } from "@/core/utils/retry";
import { supabase_service } from "@/infra/db/supabase_service";
import {
  ProviderError,
  ResourceActionError,
  ResourceNotFoundError,
  ValidationError
} from "@/lib/api/errors";
import { MESSAGE } from "@/lib/api/error-codes";

export async function createSubscription(plan_id: string, user: User) {
  const serviceRepo = getServiceRepository(supabase_service);
  const plan = await serviceRepo.findById(plan_id);
  if (plan.error || !plan.data?.external_plan_id) {
    throw new ValidationError(MESSAGE.PLAN_NOT_FOUND);
  }

  const externalPlanId = plan.data.external_plan_id;

  // Valida si hay una suscripción pendiente para este usuario y el mismo plan
  const subscriptionPending = await SubscriptionRepository.findAllByUserAndStatus(user.id, ['APPROVAL_PENDING']);
  if(!subscriptionPending.error && subscriptionPending.data?.[0]?.service_id === plan_id) {
    // Hay una suscripción pendiente y se almacenó el ID de PayPal
    if(subscriptionPending.data[0].external_subscription_id) {
      const idSubscriptionPaypal = subscriptionPending.data[0].external_subscription_id;
      const subscriptionPaypal = await BillingRepository.getSubscription(idSubscriptionPaypal);

      if(subscriptionPaypal.result) {
        if((subscriptionPaypal.result.status as never) === 'APPROVAL_PENDING') {
          return subscriptionPaypal.result.id;
        }

        await SubscriptionRepository.updateById(subscriptionPending.data[0].id, {
          status: subscriptionPaypal.result.status,
        });

        // Por alguna razón no se actualizó el estado en la Base de Datos (el pago no está pendiente)
        return null;
      }
    }
    // Hay una suscripción pendiente, pero, NO se almacenó el ID de PayPal
    else {
      // TODO: este caso
    }
  }

  const { data: customId } = await SubscriptionRepository.generateUniqueUUID();
  const paypalRequestId = customId ?? undefined;

  const subscriptionPaypal = await retry(() => BillingRepository.createSubscription({
    plan_id: externalPlanId,
    custom_id: customId ?? undefined,
    subscriber: {
      name: {
        given_name: user.user_metadata?.name ?? user.user_metadata?.display_name,
      },
      email_address: user.new_email ?? user.email,
    }
  }, paypalRequestId), 2, 50);

  if (!subscriptionPaypal.result?.id) {
    throw new ValidationError(MESSAGE.PAYPAL_PLAN_NOT_FOUND);
  }

  const subscription = await SubscriptionRepository.create({
    id: customId ?? undefined,
    service_id: plan.data.id,
    subscription_gateway: 'paypal',
    external_subscription_id: subscriptionPaypal.result.id,
    user_id: user.id,
    status: 'APPROVAL_PENDING', // subscriptionPaypal.result.status,
  });

  if (subscription.error || !subscription.data) {
    throw new ProviderError("Error creating subscription");
  }

  return subscriptionPaypal.result.id;
}

export async function captureSubscription(external_subscription_id: string, user: User) {
  const subscriptionPending = await SubscriptionRepository.findAllByUserAndStatus(user.id, ['APPROVAL_PENDING']);
  const subscriptionFiltered = subscriptionPending.data?.find(
    (item) => item.external_subscription_id === external_subscription_id);

  if(!subscriptionFiltered) {
    throw new ResourceNotFoundError("No approval pending found");
  }

  const idSubscriptionPaypal: string = subscriptionFiltered.external_subscription_id as string;
  const subscriptionPaypal = await BillingRepository.getSubscription(idSubscriptionPaypal);

  if(! subscriptionPaypal.result || (subscriptionPaypal.result.status as never) === 'APPROVAL_PENDING') {
    throw new ProviderError("Error capturing subscription");
  }

  const { error } = await SubscriptionRepository.updateById(subscriptionFiltered.id, {
    status: subscriptionPaypal.result.status,
  });

  if(error) {
    throw new ResourceActionError("Error updating resource");
  }

  const subscriber = (subscriptionPaypal.result as ISubscriber)?.subscriber;

  return {
    suscriber: {
      email_address: subscriber?.email_address,
      name: subscriber?.name
    }
  };
}

type ISubscriber = { subscriber: { email_address: string, name: never } };
