import 'server-only';

import { AuthorizationRepository } from "@/infra/db/authorization.repository";
import { AccessService } from "@/features/authorization/services/access.service";
import { AuthorizationService } from "@/features/authorization/services/authorization.service";
import { EntitlementService } from "@/features/authorization/services/entitlement.service";
import { Permission, PermissionScope } from "@/features/authorization/types/permission";
import { cache } from "react";
import { SessionNotFoundError } from "@/lib/api/errors";
import { AccessContext } from "@/features/authorization/types/access-context";
import * as z from "zod";

/** @deprecated Usar consultas específicas; se conserva para el contrato de exportación. */
export const getAccessContext = cache(async function getAccessContext(): Promise<AccessContext> {
    const service = await getAccessService();
    return service.resolve();
});

const linkCreationAccessSchema = z.object({
    anonymous: z.boolean(),
    plan_key: z.string().nullable(),
    default_team_id: z.uuid().nullable(),
    monthly_limit: z.number().nullable(),
});

export const getLinkCreationAccess = cache(async function getLinkCreationAccess() {
    const repository = new AuthorizationRepository();
    return linkCreationAccessSchema.parse(await repository.getLinkCreationAccess());
});

export const getDefaultTeamAccess = cache(async function getDefaultTeamAccess(permission?: Permission) {
    const repository = new AuthorizationRepository();
    return repository.getDefaultTeamAccess(permission);
});

export const getEffectiveService = cache(async function getEffectiveService() {
    const service = await getAccessService();
    return service.getService();
});

export const hasTeamPermission = cache(async function hasTeamPermission(
    teamId: string | null,
    permission: Permission,
): Promise<boolean> {
    const service = await getAccessService();
    return service.hasTeamPermission(teamId, permission);
});

const getAccessService = cache(async function getAccessService() {
    const repository = new AuthorizationRepository();
    return new AccessService(repository);
});

/** @deprecated Devuelve el contexto completo para compatibilidad. */
export async function requirePermission(
    permission: Permission,
    scope?: PermissionScope,
) {
    const context = await getAccessContext();

    if (!context) {
        throw new SessionNotFoundError();
    }

    const authorization = new AuthorizationService();
    authorization.require(
        context,
        permission,
        scope,
    );

    return context;
}

/** @deprecated Devuelve el contexto completo para compatibilidad. */
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