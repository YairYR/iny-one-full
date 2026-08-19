import {withErrorHandling} from "@/lib/api/http";
import {NextRequest} from "next/server";
import * as z from "zod";
import {createClient} from "@/lib/supabase/server";
import {SessionNotFoundError} from "@/lib/api/errors";
import {User} from "@supabase/auth-js";
import {getPayPalClient} from "@/lib/paypal";
import {SubscriptionsController} from "@paypal/paypal-server-sdk";
import {successResponse} from "@/lib/api/responses";

const SubscriptionBodyRequest = z.object({
    id: z.string(),
});

export const PATCH = withErrorHandling(async (request: NextRequest, ctx: RouteContext<'/api/v1/subscription/approve'>) => {
    const bodyNoValidated = await request.json();
    const { id } = SubscriptionBodyRequest.parse(bodyNoValidated);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if(!data.user || error) {
        throw new SessionNotFoundError()
    }

    const user: User = data.user;

    const paypal = getPayPalClient();
    const subscriptionsController = new SubscriptionsController(paypal);

    const res = await subscriptionsController.captureSubscription({ id: user.id });
    return successResponse(res);
});
