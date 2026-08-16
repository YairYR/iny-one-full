import { BillingRepository } from "@/infra/payments/billing.repository";
import {SubscriptionRepository, SubscriptionStatus} from "@/infra/db/subscription.repository";
import { User } from "@supabase/auth-js";
import { supabase_service } from "@/infra/db/supabase_service";
import {
  ProviderError,
  ResourceActionError,
  ResourceNotFoundError, ServiceError,
  ValidationError
} from "@/lib/api/errors";
import { MESSAGE } from "@/lib/api/error-codes";
import {createServicesRepository} from "@/infra/db/services.repository";
import {SubscriptionsController} from "@paypal/paypal-server-sdk";
import {getPayPalClient} from "@/lib/paypal";
import {Subscription} from "@/lib/entities";

/**
 * TODO: Validar si ya tiene una suscripción activa!!
 *
 * @param plan_id
 * @param user
 */
export async function createSubscription(plan_id: string, user: User) {
  const serviceRepo = createServicesRepository(supabase_service);
  const plan = await serviceRepo.getPlanById(plan_id);
  if (plan.error || !plan.data?.external_service_id) {
    throw new ValidationError(MESSAGE.PLAN_NOT_FOUND);
  }

  const externalPlanId = plan.data.external_service_id;
  let subscription: Partial<Subscription>|null = null;

  // Valida si hay una suscripción pendiente para este usuario y el mismo plan
  const subscriptionPending = await SubscriptionRepository.findAllByUserAndStatus(user.id, ['APPROVAL_PENDING', 'INSERTED']);
  if(!subscriptionPending.error) {
    const filteredSubscription = subscriptionPending.data.find(plan => plan.service_id == plan_id);
    // TODO: usar "filteredSubscription" para no crear siempre una suscripción, dependiendo del caso.

    if (filteredSubscription) {
      if (filteredSubscription.status === 'INSERTED') {
        // TODO
        subscription = filteredSubscription;
      } else if (filteredSubscription.status === 'APPROVAL_PENDING') {
        // TODO: validar si tiene un "external_subscription_id"
        if (filteredSubscription.external_subscription_id) {
          return filteredSubscription.external_subscription_id;
        } else {
          // TODO: hacer algo si hay una suscripción pendiente, pero no se guardó el id (?
          // TODO: borrar la suscripción (???
        }
      }
    }

    /**
     *
     * TODO: Capturar la suscripción
     *
     *
     *
     */

    /*
    // Hay una suscripción pendiente y se almacenó el ID de PayPal
    if(subscriptionPending.data[0].external_subscription_id) {
      const idSubscriptionPaypal = subscriptionPending.data[0].external_subscription_id;
      const subscriptionPaypal = await BillingRepository.getSubscription(idSubscriptionPaypal);

      if(subscriptionPaypal.result) {
        if((subscriptionPaypal.result.status as never) === 'APPROVAL_PENDING') {
          return subscriptionPaypal.result.id;
        }

        await SubscriptionRepository.updateById(subscriptionPending.data[0].id, {
          status: subscriptionPaypal.result.status as any,
        });

        // Por alguna razón no se actualizó el estado en la Base de Datos (el pago no está pendiente)
        return null;
      }
    }
    // Hay una suscripción pendiente, pero, NO se almacenó el ID de PayPal
    else {
      throw new ServiceError();
    }
     */
  }

  if (subscription === null) {
    const reqSubscription = await SubscriptionRepository.create({
      service_id: plan.data.id,
      subscription_gateway: 'paypal',
      external_subscription_id: null,
      user_id: user.id,
      status: 'INSERTED',
    });

    /**
     *
     * TODO: Actualmente siempre se está creando una nueva suscripción en BD
     *
     */

    if (reqSubscription.error || !reqSubscription.data) {
      throw new ProviderError("Error creating subscription");
    }

    subscription = reqSubscription.data;
  }

  const paypal = getPayPalClient();
  const subscriptionsController = new SubscriptionsController(paypal);

  const subscriptionPaypal = await subscriptionsController.createSubscription({
    prefer: 'return=minimal',
    paypalRequestId: subscription.id,
    body: {
      planId: externalPlanId,
      customId: subscription.id,
      subscriber: {
        name: {
          givenName: user.user_metadata?.name ?? user.user_metadata?.display_name,
        },
        emailAddress: user.new_email ?? user.email,
      }
    }
  });

  if (!subscriptionPaypal.result?.id) {
    throw new ValidationError(MESSAGE.PAYPAL_PLAN_NOT_FOUND);
  }

  const newStatus: SubscriptionStatus = (typeof subscriptionPaypal.body === 'string')
      ? (
          JSON.parse(subscriptionPaypal.body)?.status ?? (subscriptionPaypal.result as any).status
      )
      : (subscriptionPaypal.result as any).status;

  const {error} = await SubscriptionRepository.updateById(subscription.id!, {
    status: newStatus ?? 'APPROVAL_PENDING',
    external_subscription_id: subscriptionPaypal.result.id
  });

  if (error) {
    console.warn("Error updating subscription payment", error);
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
    status: subscriptionPaypal.result.status as any,
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

function checkSubscriptionStatus(user: User) {
  //
}

type ISubscriber = { subscriber: { email_address: string, name: never } };
