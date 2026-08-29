'use server';

import { Logger, logger } from "@/lib/logger";
import { ServiceError, SessionNotFoundError, UserAlReadyHasPlanError, ValidationError, } from "@/lib/api/errors";
import { getOrderRepository } from "@/infra/db/order.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { SubscriptionRepository } from "@/infra/db/subscription.repository";
import { createClient } from "@/lib/supabase/server";
import { getUserRepository } from "@/infra/db/user.repository";
import { User } from "@supabase/auth-js";
import { SubscriptionsController } from "@paypal/paypal-server-sdk";
import { getPayPalClient } from "@/lib/paypal";
import { after } from "next/server";
import { SubscriptionRequestsRepository } from "@/infra/db/subscription-requests.repository";
import { MESSAGE } from "@/lib/api/error-codes";

const log = logger.child({ action: "create-subscription" });

/**
 * Crea una suscripción para el usuario actual y el servicio de la orden pendiente.
 *
 * Sigue la máquina de estados descrita en SISTEMA_BILLING.txt:
 * - Si el usuario ya tiene una suscripción ACTIVE/APPROVED para el servicio, no se permite duplicar.
 * - Si hay una suscripción en curso con external_subscription_id (APPROVAL_PENDING, SUSPENDED, etc.),
 *   se reutiliza en vez de crear una nueva en PayPal.
 * - Si quedó INSERTED sin external_subscription_id, se reintenta la creación en PayPal.
 * - Si no hay ninguna suscripción reutilizable (primera vez, o la anterior quedó CANCELLED/EXPIRED),
 *   se crea una nueva suscripción desde cero.
 *
 * @returns {Promise<{subscriptionId: string}>} - El ID de la suscripción en PayPal
 * @throws {SessionNotFoundError} - Si no hay un usuario autenticado
 * @throws {ServiceError} - Si ocurre un error al crear la suscripción
 * @throws {UserAlReadyHasPlanError} - Si el usuario ya tiene una suscripción activa para el servicio
 */
export async function actionCreateSubscription(): Promise<{ subscriptionId: string; }> {
    const logAction = log.child({ action: "create subscription" });
    logAction.info("Create subscription");

    const supabase = await createClient();
    const usersRepo = getUserRepository(supabase);
    const { data: { user } } = await usersRepo.getCurrentUser();
    if (!user) {
        throw new SessionNotFoundError();
    }

    const orderRepo = getOrderRepository(supabase_service);
    const pendingOrder = await orderRepo.findPendingByUserId(user.id);
    const externalPlanId = pendingOrder.data?.services?.external_service_id;
    if (!pendingOrder.data || pendingOrder.error || !externalPlanId) {
        throw new ServiceError("Failed to get pending order");
    }
    const serviceId = pendingOrder.data.service_id as string;

    logAction.debug("Checking current subscription");
    const currentSubscription = await getReusableSubscription(serviceId, user.id);

    // Primera vez, o la anterior quedó CANCELLED/EXPIRED: se crea una suscripción nueva desde cero.
    if (!currentSubscription) {
        const subscription = await insertSubscription(logAction, user.id, serviceId);
        const subscriptionId = await createPaypalSubscriptionAndUpdateSubscription(logAction, externalPlanId, subscription.id, user);
        return { subscriptionId };
    }

    // Ya existe una intención en curso con PayPal (APPROVAL_PENDING, APPROVED, SUSPENDED...):
    // se reutiliza en vez de crear una segunda suscripción en PayPal.
    if (currentSubscription.external_subscription_id) {
        return { subscriptionId: currentSubscription.external_subscription_id };
    }

    // INSERTED sin external_subscription_id: la creación en PayPal falló o quedó incompleta antes.
    if (currentSubscription.status === 'INSERTED') {
        const subscriptionId = await createPaypalSubscriptionAndUpdateSubscription(logAction, externalPlanId, currentSubscription.id, user);
        return { subscriptionId };
    }

    logAction.error("Subscription in unexpected state without external id", {
        subscriptionId: currentSubscription.id,
        status: currentSubscription.status,
    });
    throw new ServiceError("Failed to create subscription");
}

/**
 * Busca la suscripción vigente del usuario para el servicio.
 * @returns la suscripción reutilizable, o `null` si se debe crear una nueva
 * @throws {UserAlReadyHasPlanError} si ya existe una suscripción ACTIVE/APPROVED
 */
async function getReusableSubscription(service_id: string, user_id: string) {
    const currentSubscription = await SubscriptionRepository.findByUserId(user_id, service_id);
    if (currentSubscription.error) {
        throw new ServiceError("Failed to check user subscription");
    }

    const subscription = currentSubscription.data;
    if (!subscription) {
        return null;
    }

    if (subscription.status === 'ACTIVE' || subscription.status === 'APPROVED') {
        // TODO: cancel order
        throw new UserAlReadyHasPlanError();
    }

    // Una suscripción CANCELLED/EXPIRED no se reutiliza: queda como histórico y se crea una nueva.
    if (subscription.status === 'CANCELLED' || subscription.status === 'EXPIRED') {
        return null;
    }

    return subscription;
}

async function insertSubscription(logAction: Logger, user_id: string, service_id: string) {
    const subscription = await SubscriptionRepository.create({
        user_id,
        service_id,
        external_subscription_id: null,
        status: 'INSERTED',
    });
    if (subscription.error || !subscription.data) {
        logAction.error("Failed to create subscription", { error: subscription.error });
        throw new ServiceError("Failed to create subscription");
    }

    logAction.debug("Subscription created (DB)", { subscriptionId: subscription.data.id });
    return subscription.data;
}

async function createPaypalSubscriptionAndUpdateSubscription(logAction: Logger, paypal_plan_id: string, subscription_id: string, user: User) {
    const subscriptionPaypal = await createPaypalSubscription(logAction, paypal_plan_id, subscription_id, user);
    if (!subscriptionPaypal.result || !subscriptionPaypal.result.id) {
        // TODO: hacer algo con la suscripción (BD)
        throw new ServiceError("Failed to Paypal create subscription");
    }

    const subscriptionUpdate = await SubscriptionRepository.updateById(subscription_id, {
        external_subscription_id: subscriptionPaypal.result.id,
        status: 'APPROVAL_PENDING',
    });

    if (subscriptionUpdate.error) {
        throw new ServiceError("Failed to update subscription with external id");
    }

    return subscriptionPaypal.result.id;
}

/**
 * Crea la suscripción en Paypal
 * @param reqLog
 * @param paypal_plan_id
 * @param request_id
 * @param user
 */
export async function createPaypalSubscription(reqLog: Logger, paypal_plan_id: string, request_id: string, user: User) {
    const paypal = getPayPalClient();
    const subscriptionsController = new SubscriptionsController(paypal);

    const subscriptionPaypal = await subscriptionsController.createSubscription({
        prefer: "return=minimal",
        paypalRequestId: request_id,
        body: {
            planId: paypal_plan_id,
            customId: request_id,
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
            request_id: request_id,
            status: subscriptionPaypal.statusCode,
        });
        after(() => SubscriptionRequestsRepository.updateStatus(request_id, "REJECTED", undefined, {
            reason: "PayPal subscription creation failed",
        }));
        throw new ValidationError(MESSAGE.PAYPAL_PLAN_NOT_FOUND);
    }

    return subscriptionPaypal;
}

/**
 * Maquina de Estados:
 *
 * INSERTED
 *    │
 *    ▼
 * APPROVAL_PENDING
 *    │
 *    ▼
 * APPROVED
 *    │
 *    ▼
 * ACTIVE
 *
 *
 * ACTIVE
 *  ├── SUSPENDED
 *  ├── CANCELLED
 *  └── EXPIRED
 */

