import {withErrorHandling} from "@/lib/api/http";
import {NextRequest} from "next/server";
import * as z from "zod";
import {createClient} from "@/lib/supabase/server";
import {SessionNotFoundError, ValidationError} from "@/lib/api/errors";
import {User} from "@supabase/auth-js";
import {errorResponse, successResponse} from "@/lib/api/responses";
import {checkSubscriptionStatus, syncRequestWithPayPal} from "@/features/payments/services/sync-subscription";
import {getUserRepository} from "@/infra/db/user.repository";
import {SubscriptionRequestsRepository} from "@/infra/db/subscription-requests.repository";
import {logger} from "@/lib/logger";

const SubscriptionBodyRequest = z.object({
    id: z.string(),
});

const log = logger.child({ service: "approve-subscription" });

export const PATCH = withErrorHandling(async (request: NextRequest) => {
    const bodyNoValidated = await request.json();
    const { id } = SubscriptionBodyRequest.parse(bodyNoValidated);

    const supabase = await createClient();
    const userRepo = getUserRepository(supabase);
    const session = await userRepo.getCurrentUser();

    if (!session.data.user) {
        throw new SessionNotFoundError();
    }

    const user: User = session.data.user;
    const subscriptionStatus = await checkSubscriptionStatus(user);
    if (!subscriptionStatus) {
        throw new ValidationError("Invalid subscription status");
    }

    if (subscriptionStatus.status !== 'ACTIVE' || !subscriptionStatus.synced) {
        const subscriptionReq = await SubscriptionRequestsRepository.findByExternalId(id);
        if (subscriptionReq.error || !subscriptionReq.data) {
            throw new ValidationError("Invalid subscription id");
        }
        const status = await syncRequestWithPayPal(subscriptionReq.data, log);
        if (status === "ACTIVE") {
            return successResponse({});
        }
        return errorResponse("Failed to activate subscription");
    }

    return successResponse({});
});
