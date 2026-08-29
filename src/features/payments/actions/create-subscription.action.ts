'use server';

import {Logger, logger} from "@/lib/logger";
import {
    ApiError,
    ServiceError,
    SessionNotFoundError,
    UserAlReadyHasPlanError,
    ValidationError
} from "@/lib/api/errors";
import {getOrderRepository} from "@/infra/db/order.repository";
import {supabase_service} from "@/infra/db/supabase_service";
import {SubscriptionRepository} from "@/infra/db/subscription.repository";
import {createPaypalSubscription} from "@/features/payments/services/create-subscription";
import {createClient} from "@/lib/supabase/server";
import {getUserRepository} from "@/infra/db/user.repository";
import {User} from "@supabase/auth-js";
import {getServiceRepository} from "@/infra/db/service.repository";

const log = logger.child({ action: "create-subscription" });

export async function actionCreateSubscription() {
    const logAction = log.child({ action: "create subscription" });
    logAction.info("Create subscription");

    // throw new ApiError("FAKE", "This endpoint is not implemented yet", { status: 501 });

    const supabase = await createClient();
    const usersRepo = getUserRepository(supabase);
    const { data: { user } } = await usersRepo.getCurrentUser();
    if (!user) {
        throw new SessionNotFoundError();
    }

    const orderRepo = getOrderRepository(supabase_service);
    const pendingOrder = await orderRepo.findPendingByUserId(user.id);
    if (!pendingOrder.data || pendingOrder.error || !pendingOrder.data.services || !pendingOrder.data.services.external_service_id) {
        throw new ServiceError("Failed to get pending order");
    }

    logAction.debug("Checking current subscription");
    const currentSubscription = await hasSubscription(user.id, pendingOrder.data.service_id as string);
    // Es la primera vez que se suscribe con este servicio en específico
    if (!currentSubscription || currentSubscription.status === 'CANCELLED' || currentSubscription.status === 'EXPIRED') {
        const subscription = await SubscriptionRepository.create({
            user_id: user.id,
            service_id: pendingOrder.data.service_id as string,
            external_subscription_id: null,
            status: 'INSERTED',
        });
        if (subscription.error || !subscription.data) {
            logAction.debug("Failed to create subscription", { error: subscription.error });
            throw new ServiceError("Failed to create subscription");
        }

        logAction.debug("Subscription created (DB)", { subscriptionId: subscription.data.id });

        const paypalSubscriptionId = await createPaypalSubscriptionAndUpdateSubscription(logAction, pendingOrder.data.services.external_service_id, subscription.data.id, user);
        return { subscriptionId: paypalSubscriptionId };
    }

    const status = currentSubscription.status;
    logAction.debug("Received external subscription", { status });

    // ya se había suscrito antes

    // Si es que está SUSPENDED ¿debería solicitar la reactivación o mandar el subscriptionId (external id)?
    if (status === 'SUSPENDED') {
        if (currentSubscription.external_subscription_id) {
            return {
                subscriptionId: currentSubscription.external_subscription_id
            }
        }
        // TODO: tiene una suscripción suspendida pero no tiene el ID de Paypal
    }

    if (status === 'INSERTED' && !currentSubscription.external_subscription_id) {
        const paypalSubscriptionId = await createPaypalSubscriptionAndUpdateSubscription(logAction, pendingOrder.data.service_id as string, currentSubscription.id, user);
        return { subscriptionId: paypalSubscriptionId };
    }

    if (status === 'INSERTED' || status === 'APPROVAL_PENDING' || status === null) {
        if (!currentSubscription.external_subscription_id) {
            // TODO: por alguna razón se crearon pero no tienen el ID de Paypal
            throw new ServiceError("Failed to create subscription");
        }

        return { subscriptionId: currentSubscription.external_subscription_id };
    }

    // tiene un estado inesperado, debería crear una nueva suscripción???
    throw new ServiceError("Failed to create subscription");
}

/**
 * Valida si tiene una suscripción activa
 * @param user_id
 * @param service_id
 */
async function hasSubscription(user_id: string, service_id: string) {
    const currentSubscription = await SubscriptionRepository.findByUserId(user_id, service_id);

    if (currentSubscription.error) {
        throw new ServiceError("Failed to check user subscription");
    }
    if (currentSubscription.data &&
        currentSubscription.data.external_subscription_id &&
        (currentSubscription.data.status === 'ACTIVE' || currentSubscription.data.status  === 'APPROVED')) {
        // TODO: cancel order
        throw new UserAlReadyHasPlanError();
    }

    return currentSubscription.data;
}

async function createPaypalSubscriptionAndUpdateSubscription(logAction: Logger, paypal_plan_id: string, subscription_id: string, user: User) {
    // TODO: corregir!!! NO estoy mandando los datos correstos FALLA
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

