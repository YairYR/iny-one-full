import {withErrorHandling} from "@/lib/api/http";
import {requirePermission} from "@/features/authorization/helpers/access";
import {successResponse} from "@/lib/api/responses";
import {PERMISSIONS} from "@/features/authorization/types/permission";

export const GET = withErrorHandling(async () => {
    const access = await requirePermission(PERMISSIONS.ADMIN_READ);

    return successResponse({
        ...access,
        permissions: Array.from(access.permissions ?? [])
    })
});