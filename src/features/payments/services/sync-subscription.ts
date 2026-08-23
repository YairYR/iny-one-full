import {getPayPalClient} from "@/lib/paypal";
import {SubscriptionsController} from "@paypal/paypal-server-sdk";
import {RequestStatus, SubscriptionRequestsRepository} from "@/infra/db/subscription-requests.repository";
import {User} from "@supabase/auth-js";
import {Logger, logger} from "@/lib/logger";
import {SubscriptionRepository, SubscriptionStatus} from "@/infra/db/subscription.repository";
import {BillingRepository} from "@/infra/payments/billing.repository";
import {createClient} from "@/lib/supabase/server";
import {PlanName, UserPlanSummary} from "@/lib/types";

const log = logger.child({ service: "sync-subscription" });

/**
 * Buscar y cancela las solicitudes pendientes para evitar problemas. (No filtra por servicio)
 * @param userId
 */
export async function rejectPendingRequests(userId: string) {
    const paypal = getPayPalClient();
    const subscriptionsController = new SubscriptionsController(paypal);

    const reason = "Cancelled due to new subscription request";

    const pendingRequests = await SubscriptionRequestsRepository.findPendingByUser(userId);

    if (pendingRequests.error) {
        log.error("could not list pending requests", { user_id: userId, error: pendingRequests.error });
        return;
    }

    for (const pendingRequest of pendingRequests.data ?? []) {
        // Orden: primero PayPal, después la base. Al revés, si la cancelación
        // fallaba la fila quedaba en REJECTED mientras la suscripción seguía
        // viva en PayPal —y cobrando—.
        if (typeof pendingRequest.external_subscription_id === "string") {
            const paypalStatus = await safeGetPaypalStatus(pendingRequest.external_subscription_id);

            // Ventana real: entre que el usuario aprueba en PayPal y llega el
            // webhook, la solicitud sigue en APPROVAL_PENDING. Cancelarla aquí
            // le anula una suscripción que acaba de pagar.
            if (paypalStatus === "ACTIVE") {
                log.warn("skipping cancellation of an already active subscription", {
                    request_id: pendingRequest.id,
                    external_id: pendingRequest.external_subscription_id,
                });
                continue;
            }

            try {
                await subscriptionsController.cancelSubscription({
                    id: pendingRequest.external_subscription_id,
                    body: { reason },
                });
            } catch (error) {
                // Un fallo no puede cortar el bucle y dejar el resto sin procesar.
                log.warn("could not cancel pending subscription in paypal", {
                    request_id: pendingRequest.id,
                    external_id: pendingRequest.external_subscription_id,
                    error,
                });
                continue;
            }
        }

        await SubscriptionRequestsRepository.updateStatus(
            pendingRequest.id, "REJECTED", undefined, { reason });
    }
}

/** Estado en PayPal, o `null` si no se puede consultar. Nunca lanza. */
async function safeGetPaypalStatus(externalId: string): Promise<string | null> {
    try {
        const sub = await BillingRepository.getSubscription(externalId);
        return (sub.result?.status as string) ?? null;
    } catch (error) {
        log.warn("could not read subscription status from paypal", { external_id: externalId, error });
        return null;
    }
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

        if (paypalStatus === 'ACTIVE') {
            await setSubscriptionUserAuth(
                await resolvePlanSummary(subscription.id, subscription.service_id, reqLog),
            );
        } else if (paypalStatus === 'CANCELLED' || paypalStatus === 'EXPIRED') {
            // Sólo los estados terminales quitan el plan. Un SUSPENDED por un
            // cobro que falló una vez dejaba al cliente sin servicio en el acto,
            // sin ningún periodo de gracia.
            await setSubscriptionUserAuth(null);
        } else {
            reqLog.warn("subscription in a non-terminal state, keeping current plan", {
                subscription_id: subscription.id,
                paypal_status: paypalStatus,
            });
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
        const syncedStatus = await syncRequestWithPayPal(request, reqLog);

        // Si alguna solicitud está ACTIVE, ya se auto-completó en syncRequestWithPayPal
        if (syncedStatus === "ACTIVE") {
            // Buscar la suscripción recién creada
            const newSub = await SubscriptionRepository.findByUserId(user.id);
            if (newSub.data) {
                await setSubscriptionUserAuth(
                    await resolvePlanSummary(newSub.data.id, newSub.data.service_id, reqLog),
                );
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

/**
 * Sincroniza el estado de una solicitud con PayPal y actualiza BD si cambió.
 * Si la solicitud está ACTIVE en PayPal, completa el proceso (upsert en subscriptions).
 *
 * @returns Estado actualizado de la solicitud, o null si falla la verificación
 */
export async function syncRequestWithPayPal(
    request: { id: string; user_id: string; service_id: string; external_subscription_id: string | null; status: string },
    reqLog: Logger
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

async function setSubscriptionUserAuth(summary: UserPlanSummary|null) {
    const supabase = await createClient();
    await supabase.auth.updateUser({
        data: {
            user_plan: summary,
        }
    })
}

/**
 * Traduce un servicio a la clave de cuota que entiende el resto del código.
 *
 * Devuelve `null` cuando el servicio no tiene `plan_key`: eso deja al usuario en
 * el plan gratuito, que es el fallo seguro. Antes se escribía "basic" fijo, así
 * que un cliente de plan pro recibía los límites del plan intermedio.
 */
async function resolvePlanSummary(
    subscriptionId: string,
    serviceId: string | null,
    reqLog: Logger,
): Promise<UserPlanSummary | null> {
    if (!serviceId) {
        reqLog.warn("subscription without service_id, falling back to free plan", { subscription_id: subscriptionId });
        return null;
    }

    const { data, error } = await SubscriptionRepository.getPlanKeyByServiceId(serviceId);

    if (error || !data?.plan_key) {
        reqLog.error("service has no plan_key, falling back to free plan", {
            subscription_id: subscriptionId,
            service_id: serviceId,
            error,
        });
        return null;
    }

    return {
        id: subscriptionId,
        name: data.plan_key as PlanName,
        isFree: data.plan_key === 'free',
    };
}
