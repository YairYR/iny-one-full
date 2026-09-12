import 'server-only';

import { AuthorizationRepository } from "@/infra/db/authorization.repository";
import { isSubscriptionEffective } from "@/features/authorization/util/subscription.utils";
import {
    AccessContextAnonymous,
    AccessContextAuthenticated
} from "@/features/authorization/types/access-context";

export class AccessService {
    constructor(
        private readonly repository: AuthorizationRepository,
    ) {}

    async resolve(userId: string): Promise<AccessContextAuthenticated> {
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

        const permissionRows = await this.repository.getRolePermissions(roleIds);
        const permissions = new Set(
            permissionRows
                .map((row) => row.permission?.key)
                .filter((key): key is string => Boolean(key)),
        );

        const effectiveSubscription = isSubscriptionEffective(subscription);

        let serviceId: string;
        let planKey: string | null;
        let effectiveSubscriptionData = null;

        if (effectiveSubscription && subscription) {
            serviceId = subscription.service_id;
            planKey = await this.repository.getServicePlanKey(serviceId);

            effectiveSubscriptionData = {
                id: subscription.id,
                serviceId: subscription.service_id,
                status: subscription.status,
                startDate: subscription.start_date,
                endDate: subscription.end_date,
            };
        } else {
            const freeService = await this.repository.getFreeService();
            serviceId = freeService.id;
            planKey = freeService.plan_key;
        }

        const entitlementRows = await this.repository.getServiceEntitlements(serviceId);
        const entitlements = new Map<string, unknown>(
            entitlementRows.map((row) => [
                row.key,
                row.value,
            ]),
        );

        return {
            userId,
            anonymous: false,
            roles,
            permissions,
            serviceId,
            subscription: effectiveSubscriptionData,
            entitlements,
            planKey,
        };
    }

    async resolveAnonymous(): Promise<AccessContextAnonymous> {
        const freeService = await this.repository.getFreeAnonymousService();
        const entitlementRows = await this.repository.getServiceEntitlements(freeService.id);
        const entitlements = new Map<string, unknown>(
            entitlementRows.map((row) => [
                row.key,
                row.value,
            ]),
        );

        return {
            anonymous: true,
            roles: new Set(),
            permissions: new Set(),
            serviceId: freeService.id,
            subscription: null,
            entitlements,
            planKey: freeService.plan_key,
        };
    }
}