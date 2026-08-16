import {withErrorHandling} from "@/lib/api/http";
import {NextRequest} from "next/server";
import {SessionNotFoundError, ValidationError} from "@/lib/api/errors";
import { z } from 'zod';
import {createClient} from "@/lib/supabase/server";
import {successResponse} from "@/lib/api/responses";
import {createSubscription} from "@/features/payments/services/payment";
import {getUserRepository} from "@/infra/db/user.repository";

const createSubscriptionSchema = z.object({
    planId: z.uuid(),
}).strict();

export const POST = withErrorHandling(async (request: NextRequest, ctx: RouteContext<'/api/v1/subscription'>) => {
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

    const currentPlan = session.data.plan;
    if (currentPlan !== null && !currentPlan.isFree) {
        // TODO: validar en Paypal
        // TODO: validar si quiere cambiar de suscripción
        throw new ValidationError("User already has a plan");
    }

    const { planId } = body.data;
    const paypalPlanId = await createSubscription(planId, session.data.user);
    return successResponse({ subscriptionId: paypalPlanId });
});
