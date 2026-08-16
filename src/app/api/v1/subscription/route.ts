import {withErrorHandling} from "@/lib/api/http";
import {NextRequest} from "next/server";
import {SessionNotFoundError, ValidationError} from "@/lib/api/errors";
import { z } from 'zod';
import {createClient} from "@/lib/supabase/server";
import {createServicesRepository} from "@/infra/db/services.repository";
import {successResponse} from "@/lib/api/responses";
import {supabase_service} from "@/infra/db/supabase_service";
import {User} from "@supabase/auth-js";
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
    const user = await userRepo.getCurrentUser();

    /*
    const { data, error } = await supabase.auth.getUser();
    if(!data.user || error) {
        throw new SessionNotFoundError();
    }

    const user: User = data.user;
    const { planId } = body.data;
     */

    throw new ValidationError("Debug");

    //const paypalPlanId = await createSubscription(planId, user);
    //return successResponse({ subscriptionId: paypalPlanId });
});
