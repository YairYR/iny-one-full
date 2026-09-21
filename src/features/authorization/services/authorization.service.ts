import { InsufficientPermissionsError } from "@/lib/api/errors";
import { AccessContext } from "@/features/authorization/types/access-context";
import { Permission, PermissionScope } from "@/features/authorization/types/permission";

export class AuthorizationService {
    can(
        context: AccessContext,
        permission: Permission,
        scope?: PermissionScope,
    ): boolean {
        if (scope) {
            if (context.anonymous) {
                return false;
            }
            const teamAccess = context.teams.get(scope.teamId);
            if (!teamAccess) {
                return false;
            }
            return teamAccess.permissions.has(permission);
        }

        return context.permissions.has(permission);
    }

    require(
        context: AccessContext,
        permission: Permission,
        scope?: PermissionScope,
    ): void {
        if (!this.can(context, permission, scope)) {
            throw new InsufficientPermissionsError();
        }
    }

    hasPermission(
        context: AccessContext,
        permission: Permission,
    ): boolean {
        return this.can(context, permission);
    }

    hasTeamPermission(
        context: AccessContext,
        teamId: string | null,
        permission: Permission,
    ): boolean {
        if (!teamId) {
            return false;
        }
        return this.can(context, permission, { teamId });
    }

    hasRole(
        context: AccessContext,
        role: string,
    ): boolean {
        return context.roles.has(role);
    }

    hasTeamRole(
        context: AccessContext,
        teamId: string | null,
        role: string,
    ): boolean {
        if (!teamId) {
            return false;
        }
        const teamAccess = context.teams.get(teamId);
        if (!teamAccess) {
            return false;
        }
        return teamAccess.role === role;
    }
}
