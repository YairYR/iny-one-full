import {withErrorHandling} from "@/lib/api/http";
import {NextRequest} from "next/server";
import { z } from 'zod';
import {ServiceError, SessionNotFoundError, UserAlReadyHasPlanError, ValidationError} from "@/lib/api/errors";
import {createClient} from "@/lib/supabase/server";
import {getUserRepository} from "@/infra/db/user.repository";
import {getOrderRepository} from "@/infra/db/order.repository";
import {supabase_service} from "@/infra/db/supabase_service";
import {getServiceRepository} from "@/infra/db/service.repository";
import {successResponse} from "@/lib/api/responses";
import {SubscriptionRepository} from "@/infra/db/subscription.repository";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const createServiceSchema = z.object({
    serviceId: z.uuid(),
}).strict();

export const POST = withErrorHandling(async (request: NextRequest) => {
    const bodyNoValidated = await request.json();
    const body = createServiceSchema.safeParse(bodyNoValidated);

    if(body.error || !body.success) {
        throw new ValidationError("Invalid request body");
    }

    const supabase = await createClient();
    const userRepo = getUserRepository(supabase);
    const session = await userRepo.getCurrentUser();

    if (!session.data.user) {
        throw new SessionNotFoundError();
    }
    const user = session.data.user;
    const serviceId = body.data.serviceId;

    const serviceRepo = getServiceRepository(supabase_service);
    const service = await serviceRepo.findById(serviceId);
    if (!service.data || service.error) {
        throw new ValidationError("Invalid service id");
    }

    await hasSubscription(user.id, serviceId);

    const orderRepo = getOrderRepository(supabase_service);
    const pendingOrder = await orderRepo.findPendingByUserId(user.id, serviceId);
    if (pendingOrder.error) {
        throw new ServiceError("Failed to get pending order");
    }

    if (pendingOrder.data) {
        return successResponse({
            orderId: pendingOrder.data.id,
            planId: service.data.external_service_id,
        })
    }

    await orderRepo.updateStatusToExpired(user.id, serviceId);

    const order = await orderRepo.create({
        user_id: user.id,
        service_id: serviceId,
        amount: 1,
        status: 'pending',
        expires_at: dayjs().utc().add(60, 'minutes').toISOString()
    });

    if (order.error) {
        throw new ServiceError("Failed to create order");
    }

    return successResponse({
        orderId: order.data[0].id,
        planId: service.data.external_service_id,
    });
});

async function hasSubscription(user_id: string, service_id: string) {
    const currentSubscription = await SubscriptionRepository.findByUserId(user_id, service_id, [
        'INSERTED',
        'APPROVAL_PENDING',
        'APPROVED',
        'ACTIVE',
        'SUSPENDED'
    ]);

    if (currentSubscription.error) {
        throw new ServiceError("Failed to check user subscription");
    }
    if (currentSubscription.data && currentSubscription.data.status === 'ACTIVE') {
        throw new UserAlReadyHasPlanError();
    }
}