import 'server-only';

import { AuthorizationRepository } from "@/infra/db/authorization.repository";
import { AccessService } from "@/features/authorization/services/access.service";
import { AuthorizationService } from "@/features/authorization/services/authorization.service";
import { EntitlementService } from "@/features/authorization/services/entitlement.service";
import { Permission } from "@/features/authorization/types/permission";
import { getCurrentUserDTO } from "@/data/dto/user-dto";
import { cache } from "react";
import { SessionNotFoundError } from "@/lib/api/errors";
import { AccessContext } from "@/features/authorization/types/access-context";

export const getAccessContext = cache(async function getAccessContext(): Promise<AccessContext> {
    const user = await getCurrentUserDTO();

    const repository = new AuthorizationRepository();
    const service = new AccessService(repository);

    if (!user) {
        return service.resolveAnonymous();
    }

    return service.resolve(user.id);
});

export async function requirePermission(
    permission: Permission,
) {
    const context = await getAccessContext();

    if (!context) {
        throw new SessionNotFoundError();
    }

    const authorization = new AuthorizationService();
    authorization.require(
        context,
        permission,
    );

    return context;
}

export async function requireFeature(
    key: string,
) {
    const context = await getAccessContext();

    if (!context) {
        throw new SessionNotFoundError();
    }

    const entitlements = new EntitlementService();
    entitlements.requireEnabled(
        context,
        key,
    );

    return context;
}