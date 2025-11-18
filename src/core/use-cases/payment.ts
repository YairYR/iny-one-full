import { BillingRepository } from "@/infra/payments/billing.repository";
import { SubscriptionRepository } from "@/infra/db/subscription.repository";
import { ServiceRepository } from "@/infra/db/service.repository";
import { User } from "@supabase/auth-js";
import { retry } from "@/core/utils/retry";

export async function createSubscription(plan_id: string, user: User) {
  const plan = await ServiceRepository.findById(plan_id);
  if (plan.error || !plan.data || !plan.data.external_plan_id) {
    return Promise.reject("Plan not found");
  }

  const externalPlanId = plan.data.external_plan_id;

  // Valida si hay una suscripción pendiente para este usuario y el mismo plan
  const subscriptionPending = await SubscriptionRepository.findAllByUserAndStatus(user.id, ['APPROVAL_PENDING']);
  if(!subscriptionPending.error && subscriptionPending.data
    && subscriptionPending.data[0] && subscriptionPending.data[0].service_id === plan_id
  ) {
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

  // const subscriptionPaypal = await BillingRepository.createSubscription({
  //   plan_id: plan.data.external_plan_id,
  //   custom_id: customId ?? undefined,
  //   subscriber: {
  //     name: {
  //       given_name: user.user_metadata?.name ?? user.user_metadata?.display_name,
  //     },
  //     email_address: user.new_email ?? user.email,
  //   }
  // }, paypalRequestId);

  const subscriptionPaypal = await retry(() => BillingRepository.createSubscription({
    plan_id: externalPlanId,
    custom_id: customId ?? undefined,
    subscriber: {
      name: {
        given_name: user.user_metadata?.name ?? user.user_metadata?.display_name,
      },
      email_address: user.new_email ?? user.email,
    }
  }, paypalRequestId), 2);

  if (!subscriptionPaypal.result) {
    // TODO: ERROR
    return Promise.reject("Plan not found");
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
    // TODO: ERROR (?
    return Promise.reject("Error creating subscription");
  }

  return subscriptionPaypal.result.id;
}

export async function captureSubscription(external_subscription_id: string, user: User) {
  const subscriptionPending = await SubscriptionRepository.findAllByUserAndStatus(user.id, ['APPROVAL_PENDING']);
  const subscriptionFiltered = subscriptionPending.data?.find(
    (item) => item.external_subscription_id === external_subscription_id);

  if(!subscriptionFiltered) {
    // TODO: ERROR
    return false;
  }

  const idSubscriptionPaypal: string = subscriptionFiltered.external_subscription_id as string;
  const subscriptionPaypal = await BillingRepository.getSubscription(idSubscriptionPaypal);

  if(! subscriptionPaypal.result) {
    // TODO: ERROR
    return false;
  }

  if((subscriptionPaypal.result.status as never) === 'APPROVAL_PENDING') {
    return false;
  }

  const { error } = await SubscriptionRepository.updateById(subscriptionFiltered.id, {
    status: subscriptionPaypal.result.status,
  });

  if(error) {
    // ERROR
    return false;
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
