import {withErrorHandling} from "@/lib/api/http";
import {NextRequest} from "next/server";
import {UserAlReadyHasPlanError, SessionNotFoundError, ValidationError} from "@/lib/api/errors";
import { z } from 'zod';
import {createClient} from "@/lib/supabase/server";
import {successResponse} from "@/lib/api/responses";
import {getUserRepository} from "@/infra/db/user.repository";
import {createSubscription} from "@/features/payments/services/create-subscription";
import {checkSubscriptionStatus} from "@/features/payments/services/sync-subscription";

const createSubscriptionSchema = z.object({
    planId: z.uuid(),
}).strict();

export const POST = withErrorHandling(async (request: NextRequest) => {
    const bodyNoValidated = await request.json();
    const body = createSubscriptionSchema.safeParse(bodyNoValidated);

    if(body.error || !body.success) {
        throw new ValidationError("Invalid request body");
    }

    const supabase = await createClient();
    const userRepo = getUserRepository(supabase);
    const session = await userRepo.getCurrentUser();

    if (!session.data.user) {
        throw new SessionNotFoundError();
    }

    // TODO: falta permitir cambiar de suscripción
    const subscriptionStatus = await checkSubscriptionStatus(session.data.user);
    if (subscriptionStatus && subscriptionStatus.status === "ACTIVE") {
        throw new UserAlReadyHasPlanError();
    }
    // Si está CANCELLED, EXPIRED, etc., permitir crear nueva

    const { planId } = body.data;
    const paypalPlanId = await createSubscription(planId, session.data.user);
    return successResponse({ subscriptionId: paypalPlanId });
});
