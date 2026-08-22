import {InsufficientPermissionsError} from "@/lib/api/errors";
import {AccessContext} from "@/features/authorization/types/access-context";
import {Permission} from "@/features/authorization/types/permission";

export class AuthorizationService {
    can(
        context: AccessContext,
        permission: Permission,
    ): boolean {
        return context.permissions.has(permission);
    }

    require(
        context: AccessContext,
        permission: Permission,
    ): void {
        if (!this.can(context, permission)) {
            throw new InsufficientPermissionsError();
        }
    }
}
