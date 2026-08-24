import { User } from "@supabase/auth-js";
import {createServicesRepository} from "@/infra/db/services.repository";
import {supabase_service} from "@/infra/db/supabase_service";
import {ProviderError, ValidationError} from "@/lib/api/errors";
import {MESSAGE} from "@/lib/api/error-codes";
import {Logger, logger} from "@/lib/logger";
import {RequestStatus, SubscriptionRequestsRepository} from "@/infra/db/subscription-requests.repository";
import {getPayPalClient} from "@/lib/paypal";
import {SubscriptionsController} from "@paypal/paypal-server-sdk";
import {after} from "next/server";
import {rejectPendingRequests} from "@/features/payments/services/sync-subscription";

const log = logger.child({ service: "payment" });

/**
 * Crea una solicitud de suscripción y la abre en PayPal.
 *
 * Flujo real:
 * 1. Valida que el plan existe y tiene `external_service_id`.
 * 2. Cancela las solicitudes pendientes del usuario, saltando las que ya están
 *    ACTIVE en PayPal para no anular algo recién pagado.
 * 3. Inserta la solicitud en BD, la crea en PayPal y guarda su `external_id`.
 *
 * La comprobación de «ya tiene una suscripción activa» NO vive aquí: la hace
 * la ruta `/api/v1/subscription` antes de llamar. El bloque comentado de abajo
 * es esa comprobación en su sitio anterior.
 *
 * @returns external_subscription_id de PayPal para redirigir al checkout
 */
export async function createSubscription(plan_id: string, user: User) {
    const reqLog = log.child({ fn: "createSubscription", user_id: user.id, plan_id });

    // Validar que el plan existe
    const plan = await getPlan(reqLog, plan_id);
    const externalPlanId = plan.external_service_id;

    if (!externalPlanId) {
        reqLog.error("plan does not have external_service_id", { plan_id });
        throw new ValidationError("External PlanId is required");
    }

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

    await rejectPendingRequests(user.id);

    const request = await insertSubscriptionRequest(reqLog, plan.id, user.id);
    const subscriptionPaypal = await createPaypalSubscription(reqLog, externalPlanId, request.id, user);

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
        // Aquí la suscripción YA existe en PayPal. Si no se guarda su id, la
        // fila queda inservible y el usuario puede acabar cobrado sin que el
        // sistema sepa a qué solicitud corresponde: es un error, no un aviso.
        reqLog.error("subscription created in paypal but not linked in the database", {
            request_id: request.id,
            external_id: subscriptionPaypal.result.id,
            error: updateResult.error,
        });
        throw new ProviderError("Subscription created but could not be linked");
    } else {
        reqLog.info("subscription created in paypal", {
            request_id: request.id,
            external_id: subscriptionPaypal.result.id,
            status: newStatus,
        });
    }

    return subscriptionPaypal.result.id;
}

async function getPlan(reqLog: Logger, plan_id: string) {
    const serviceRepo = createServicesRepository(supabase_service);
    const plan = await serviceRepo.getPlanById(plan_id);
    if (plan.error || !plan.data?.external_service_id) {
        reqLog.error("plan not found", { error: plan.error });
        throw new ValidationError(MESSAGE.PLAN_NOT_FOUND);
    }
    return plan.data;
}

async function insertSubscriptionRequest(reqLog: Logger, plan_id: string, user_id: string) {
    const requestResult = await SubscriptionRequestsRepository.create({
        service_id: plan_id,
        subscription_gateway: "paypal",
        external_subscription_id: null,
        user_id: user_id,
        status: "INSERTED",
        request_type: "new",
    });

    if (requestResult.error || !requestResult.data) {
        reqLog.error("failed to create subscription request", { error: requestResult.error });
        throw new ProviderError("Error creating subscription request");
    }

    reqLog.info("created subscription request", { request_id: requestResult.data.id });

    return requestResult.data;
}

/**
 * Crea la suscripción en Paypal
 * @param reqLog
 * @param paypal_plan_id
 * @param request_id
 * @param user
 */
async function createPaypalSubscription(reqLog: Logger, paypal_plan_id: string, request_id: string, user: User) {
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
