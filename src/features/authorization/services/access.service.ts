import 'server-only';

import {AuthorizationRepository} from "@/infra/db/authorization.repository";
import {isSubscriptionEffective} from "@/features/authorization/util/subscription.utils";

export class AccessService {
    constructor(
        private readonly repository: AuthorizationRepository,
    ) {}

    async resolve(userId: string) {
        const [
            roleRows,
            subscription,
        ] = await Promise.all([
            this.repository.getUserRoles(userId),
            this.repository.getSubscription(userId),
        ]);

        const roleIds = roleRows
            .map((row) => row.role?.id)
            .filter((id): id is string => Boolean(id));

        const roles = new Set(
            roleRows
                .map((row) => row.role?.key)
                .filter((key): key is string => Boolean(key)),
        );

        const permissionRows =
            await this.repository.getRolePermissions(roleIds);

        const permissions = new Set(
            permissionRows
                .map((row) => row.permission?.key)
                .filter((key): key is string => Boolean(key)),
        );

        const effectiveSubscription =
            isSubscriptionEffective(subscription);

        let serviceId: string;
        let effectiveSubscriptionData = null;

        if (effectiveSubscription && subscription) {
            serviceId = subscription.service_id;

            effectiveSubscriptionData = {
                id: subscription.id,
                serviceId: subscription.service_id,
                status: subscription.status,
                startDate: subscription.start_date,
                endDate: subscription.end_date,
            };
        } else {
            const freeService =
                await this.repository.getFreeService();

            serviceId = freeService.id;
        }

        const entitlementRows =
            await this.repository.getServiceEntitlements(serviceId);

        const entitlements = new Map<string, unknown>(
            entitlementRows.map((row) => [
                row.key,
                row.value,
            ]),
        );

        return {
            userId,
            roles,
            permissions,
            serviceId,
            subscription: effectiveSubscriptionData,
            entitlements,
        };
    }
}