import { BillingRepository } from "@/infra/payments/billing.repository";
import { SubscriptionRepository, SubscriptionStatus } from "@/infra/db/subscription.repository";
import {
  SubscriptionRequestsRepository,
  RequestStatus,
} from "@/infra/db/subscription-requests.repository";
import { User } from "@supabase/auth-js";
import { supabase_service } from "@/infra/db/supabase_service";
import {
  ProviderError,
  ResourceActionError,
  ResourceNotFoundError,
  ServiceError,
  ValidationError,
} from "@/lib/api/errors";
import { MESSAGE } from "@/lib/api/error-codes";
import { createServicesRepository } from "@/infra/db/services.repository";
import { SubscriptionsController } from "@paypal/paypal-server-sdk";
import { getPayPalClient } from "@/lib/paypal";
import { logger } from "@/lib/logger";
import {after} from "next/server";

const log = logger.child({ service: "payment" });

/**
 * Sincroniza el estado de una solicitud con PayPal y actualiza BD si cambió.
 * Si la solicitud está ACTIVE en PayPal, completa el proceso (upsert en subscriptions).
 * 
 * @returns Estado actualizado de la solicitud, o null si falla la verificación
 */
async function syncRequestWithPayPal(
  request: { id: string; user_id: string; service_id: string; external_subscription_id: string | null; status: string },
  reqLog: ReturnType<typeof log.child>
) {
  if (!request.external_subscription_id) {
    return null;
  }

  try {
    const paypalSub = await BillingRepository.getSubscription(request.external_subscription_id);
    const paypalStatus = paypalSub.result?.status as string;

    if (!paypalStatus) {
      reqLog.warn("paypal returned no status", { request_id: request.id });
      return null;
    }

    // Si el estado cambió, actualizar en BD
    if (paypalStatus !== request.status) {
      reqLog.info("syncing request status with paypal", {
        request_id: request.id,
        old_status: request.status,
        new_status: paypalStatus,
      });

      await SubscriptionRequestsRepository.updateStatus(
        request.id,
        paypalStatus as RequestStatus
      );

      // Si está ACTIVE, completar el proceso (crear/actualizar subscriptions)
      if (paypalStatus === "ACTIVE") {
        const subscriptionData = {
          user_id: request.user_id,
          service_id: request.service_id,
          status: "ACTIVE" as SubscriptionStatus,
          subscription_gateway: "paypal",
          external_subscription_id: request.external_subscription_id,
          start_date: new Date().toISOString(),
          end_date: null,
        };

        const upsertResult = await SubscriptionRepository.upsert(subscriptionData);

        if (upsertResult.data) {
          await SubscriptionRequestsRepository.updateSubscriptionId(
            request.id,
            upsertResult.data.id
          );
          reqLog.info("auto-completed subscription from pending request", {
            request_id: request.id,
            subscription_id: upsertResult.data.id,
          });
        }
      }

      return paypalStatus;
    }

    return paypalStatus;
  } catch (error) {
    reqLog.warn("failed to sync request with paypal", {
      request_id: request.id,
      external_id: request.external_subscription_id,
      error,
    });
    return null;
  }
}

/**
 * Crea una nueva solicitud de suscripción o reutiliza una pendiente reciente.
 * 
 * Flujo:
 * 1. Valida que el plan existe
 * 2. Usa checkSubscriptionStatus() para verificar y sincronizar estado con PayPal
 *    (busca en subscriptions Y subscription_requests, auto-completa si está ACTIVE)
 * 3. Busca solicitudes pendientes recientes (< 1 hora) para reutilizar external_id
 * 4. Si no existe: crea nueva solicitud en BD → crea en PayPal → actualiza BD
 * 
 * @returns external_subscription_id de PayPal para redirect al checkout
 */
export async function createSubscription(plan_id: string, user: User) {
  const serviceRepo = createServicesRepository(supabase_service);
  const reqLog = log.child({ fn: "createSubscription", user_id: user.id, plan_id });

  // Validar que el plan existe
  const plan = await serviceRepo.getPlanById(plan_id);
  if (plan.error || !plan.data?.external_service_id) {
    reqLog.warn("plan not found", { error: plan.error });
    throw new ValidationError(MESSAGE.PLAN_NOT_FOUND);
  }

  const externalPlanId = plan.data.external_service_id;

  /*
  // Verificar y sincronizar suscripción vigente con PayPal
  // checkSubscriptionStatus busca en subscriptions Y en subscription_requests
  const currentStatus = await checkSubscriptionStatus(user);
  if (currentStatus && currentStatus.status === "ACTIVE") {
    reqLog.info("user already has active subscription", {
      subscription_id: currentStatus.subscription_id,
      external_id: currentStatus.external_id,
    });
    throw new ValidationError("User already has an active subscription");
  }
   */

  // Buscar y cancela las solicitudes pendientes para evitar problemas. (No filtra por servicio)
  const pendingRequests = await SubscriptionRequestsRepository.findPendingByUser(user.id);
  if (!pendingRequests.error && pendingRequests.data && pendingRequests.data.length > 0) {
    for (let i = 0; i < pendingRequests.data.length; i++) {
      const pendingRequest = pendingRequests.data[i];
      await SubscriptionRequestsRepository.updateStatus(pendingRequest.id, "REJECTED", undefined, {
        reason: "Cancelled due to new subscription request",
      });
    }
  }

  const requestResult = await SubscriptionRequestsRepository.create({
    service_id: plan.data.id,
    subscription_gateway: "paypal",
    external_subscription_id: null,
    user_id: user.id,
    status: "INSERTED",
    request_type: "new",
  });

  if (requestResult.error || !requestResult.data) {
    reqLog.error("failed to create subscription request", { error: requestResult.error });
    throw new ProviderError("Error creating subscription request");
  }

  const request = requestResult.data;
  reqLog.info("created subscription request", { request_id: request.id });

  // Crear suscripción en PayPal
  const paypal = getPayPalClient();
  const subscriptionsController = new SubscriptionsController(paypal);

  const subscriptionPaypal = await subscriptionsController.createSubscription({
    prefer: "return=minimal",
    paypalRequestId: request.id,
    body: {
      planId: externalPlanId,
      customId: request.id,
      subscriber: {
        name: {
          givenName: user.user_metadata?.name ?? user.user_metadata?.display_name,
        },
        emailAddress: user.new_email ?? user.email,
      },
    },
  });

  if (!subscriptionPaypal.result?.id) {
    reqLog.error("paypal subscription creation failed", {
      request_id: request.id,
      status: subscriptionPaypal.statusCode,
    });
    after(() => SubscriptionRequestsRepository.updateStatus(request.id, "REJECTED", undefined, {
      reason: "PayPal subscription creation failed",
    }));
    throw new ValidationError(MESSAGE.PAYPAL_PLAN_NOT_FOUND);
  }

  // Determinar status de PayPal
  const newStatus: RequestStatus =
    typeof subscriptionPaypal.body === "string"
        // @ts-expect-error status si existe
      ? JSON.parse(subscriptionPaypal.body)?.status ?? (subscriptionPaypal.result).status
        // @ts-expect-error status si existe
      : (subscriptionPaypal.result).status;

  // Actualizar solicitud con external_id y status de PayPal
  const updateResult = await SubscriptionRequestsRepository.updateStatus(
    request.id,
    newStatus ?? "APPROVAL_PENDING",
    subscriptionPaypal.result.id
  );

  if (updateResult.error) {
    reqLog.warn("failed to update subscription request", {
      request_id: request.id,
      external_id: subscriptionPaypal.result.id,
      error: updateResult.error,
    });
  } else {
    reqLog.info("subscription created in paypal", {
      request_id: request.id,
      external_id: subscriptionPaypal.result.id,
      status: newStatus,
    });
  }

  return subscriptionPaypal.result.id;
}

/**
 * Captura (confirma) una suscripción tras aprobación del usuario en PayPal.
 * 
 * Flujo:
 * 1. Busca la solicitud en subscription_requests por external_id
 * 2. Verifica que esté en APPROVAL_PENDING
 * 3. Consulta el estado actual en PayPal
 * 4. Si está ACTIVE: crea/actualiza en subscriptions (upsert)
 * 5. Actualiza la solicitud con el nuevo estado y vincula subscription_id
 * 
 * @returns Información del suscriptor
 */
export async function captureSubscription(external_subscription_id: string, user: User) {
  const reqLog = log.child({ fn: "captureSubscription", user_id: user.id, external_subscription_id });

  if (!external_subscription_id) {
    reqLog.warn("external_subscription_id is null or undefined");
    throw new ValidationError("Invalid external subscription ID");
  }

  // Buscar solicitud en subscription_requests
  const requestResult = await SubscriptionRequestsRepository.findByExternalId(
    external_subscription_id,
    user.id
  );

  if (!requestResult.data) {
    reqLog.warn("subscription request not found");
    throw new ResourceNotFoundError("Subscription request not found");
  }

  const request = requestResult.data;

  if (request.status !== "APPROVAL_PENDING") {
    reqLog.warn("subscription request not in APPROVAL_PENDING state", { status: request.status });
    throw new ValidationError("Subscription is not pending approval");
  }

  // Consultar estado actual en PayPal
  let subscriptionPaypal;
  try {
    subscriptionPaypal = await BillingRepository.getSubscription(external_subscription_id);
  } catch (error) {
    reqLog.error("failed to get subscription from paypal", { error });
    throw new ProviderError("Error communicating with PayPal");
  }

  if (!subscriptionPaypal.result) {
    reqLog.error("paypal returned no subscription result");
    throw new ProviderError("Invalid response from PayPal");
  }

  const paypalStatus = subscriptionPaypal.result.status as string;

  // Si aún está pendiente en PayPal, rechazar
  if (paypalStatus === "APPROVAL_PENDING") {
    reqLog.info("subscription still pending in paypal");
    throw new ProviderError("Subscription is still pending approval");
  }

  const subscriber = (subscriptionPaypal.result as ISubscriber)?.subscriber;
  reqLog.info("paypal subscription status retrieved", { status: paypalStatus });

  // Si está activa, crear/actualizar en subscriptions
  let subscriptionId = request.subscription_id;

  if (paypalStatus === "ACTIVE") {
    const subscriptionData = {
      user_id: user.id,
      service_id: request.service_id,
      status: paypalStatus as SubscriptionStatus,
      subscription_gateway: "paypal",
      external_subscription_id: external_subscription_id,
      started_at: new Date().toISOString(),
      expires_at: null,
    };

    const upsertResult = await SubscriptionRepository.upsert(subscriptionData);

    if (upsertResult.error || !upsertResult.data) {
      reqLog.error("failed to upsert subscription", { error: upsertResult.error });
      throw new ResourceActionError("Error updating subscription");
    }

    subscriptionId = upsertResult.data.id;
    reqLog.info("subscription activated", { subscription_id: subscriptionId });
  }

  // Actualizar solicitud con nuevo estado y vincular subscription_id si aplica
  const updateResult = await SubscriptionRequestsRepository.updateStatus(
    request.id,
    paypalStatus as RequestStatus
  );

  if (updateResult.error) {
    reqLog.warn("failed to update request status", { error: updateResult.error });
  }

  if (subscriptionId && subscriptionId !== request.subscription_id) {
    await SubscriptionRequestsRepository.updateSubscriptionId(request.id, subscriptionId);
  }

  return {
    suscriber: {
      email_address: subscriber?.email_address,
      name: subscriber?.name,
    },
  };
}

/**
 * Verifica y sincroniza el estado de la suscripción del usuario con PayPal.
 * 
 * Flujo:
 * 1. Busca la suscripción vigente en subscriptions
 * 2. Si no existe, busca solicitudes pendientes en subscription_requests
 * 3. Verifica en PayPal y sincroniza BD
 * 4. Si una solicitud pendiente está ACTIVE en PayPal, la completa automáticamente
 * 
 * Esto maneja el caso donde el usuario aprobó en PayPal pero nunca se llamó capture.
 * 
 * @returns Estado actual de la suscripción o null si no tiene
 */
export async function checkSubscriptionStatus(user: User) {
  const reqLog = log.child({ fn: "checkSubscriptionStatus", user_id: user.id });

  // 1. Buscar suscripción vigente del usuario
  const subscriptionResult = await SubscriptionRepository.findByUserId(user.id);

  if (subscriptionResult.data) {
    const subscription = subscriptionResult.data;
    const externalId = subscription.external_subscription_id;

    if (!externalId) {
      reqLog.warn("subscription has no external_id", { subscription_id: subscription.id });
      return {
        subscription_id: subscription.id,
        status: subscription.status,
        service_id: subscription.service_id,
        synced: false,
      };
    }

    // Consultar estado en PayPal
    let paypalSubscription;
    try {
      paypalSubscription = await BillingRepository.getSubscription(externalId);
    } catch (error) {
      reqLog.error("failed to get subscription from paypal", { external_id: externalId, error });
      return {
        subscription_id: subscription.id,
        status: subscription.status,
        service_id: subscription.service_id,
        synced: false,
        error: "Failed to sync with PayPal",
      };
    }

    if (!paypalSubscription.result) {
      reqLog.error("paypal returned no subscription result", { external_id: externalId });
      return {
        subscription_id: subscription.id,
        status: subscription.status,
        service_id: subscription.service_id,
        synced: false,
      };
    }

    const paypalStatus = paypalSubscription.result.status as string;
    reqLog.info("paypal subscription status retrieved", {
      external_id: externalId,
      paypal_status: paypalStatus,
      db_status: subscription.status,
    });

    // Sincronizar si el estado cambió
    if (paypalStatus !== subscription.status) {
      const validStatuses: SubscriptionStatus[] = ["ACTIVE", "SUSPENDED", "CANCELLED", "EXPIRED"];
      
      if (validStatuses.includes(paypalStatus as SubscriptionStatus)) {
        const updateResult = await SubscriptionRepository.updateById(subscription.id, {
          status: paypalStatus as SubscriptionStatus,
        });

        if (updateResult.error) {
          reqLog.error("failed to update subscription status", {
            subscription_id: subscription.id,
            new_status: paypalStatus,
            error: updateResult.error,
          });
        } else {
          reqLog.info("subscription status synchronized", {
            subscription_id: subscription.id,
            old_status: subscription.status,
            new_status: paypalStatus,
          });
        }
      } else {
        reqLog.warn("paypal returned invalid status", { paypal_status: paypalStatus });
      }
    }

    return {
      subscription_id: subscription.id,
      status: paypalStatus as SubscriptionStatus,
      service_id: subscription.service_id,
      external_id: externalId,
      synced: true,
    };
  }

  // 2. No hay suscripción vigente, verificar solicitudes pendientes
  reqLog.info("no active subscription found, checking pending requests");
  
  const pendingRequests = await SubscriptionRequestsRepository.findPendingByUser(user.id);
  
  if (!pendingRequests.data || pendingRequests.data.length === 0) {
    reqLog.info("no pending requests found");
    return null;
  }

  // 3. Verificar cada solicitud pendiente en PayPal
  for (const request of pendingRequests.data) {
    /*
    if (!request.external_subscription_id) {
      await SubscriptionRequestsRepository.updateStatus(request.id, "REJECTED", undefined, {
        reason: "Missing external_subscription_id",
      });
      continue;
    }
     */

    const syncedStatus = await syncRequestWithPayPal(request, reqLog);
    
    // Si alguna solicitud está ACTIVE, ya se auto-completó en syncRequestWithPayPal
    if (syncedStatus === "ACTIVE") {
      // Buscar la suscripción recién creada
      const newSub = await SubscriptionRepository.findByUserId(user.id);
      if (newSub.data) {
        reqLog.info("found active subscription from pending request", {
          request_id: request.id,
          subscription_id: newSub.data.id,
        });
        return {
          subscription_id: newSub.data.id,
          status: newSub.data.status,
          service_id: newSub.data.service_id,
          external_id: newSub.data.external_subscription_id,
          synced: true,
        };
      }
    }
  }

  reqLog.info("no active subscription found after checking pending requests");
  return null;
}

type ISubscriber = { subscriber: { email_address: string; name: never } };
