import { AccessContext } from "@/features/authorization/types/access-context";
import { InsufficientPermissionsError } from "@/lib/api/errors";

export class EntitlementService {
    get(
        context: AccessContext,
        key: string,
    ): unknown {
        return context.entitlements.get(key);
    }

    getBoolean(
        context: AccessContext,
        key: string,
    ): boolean {
        const value = this.get(context, key);

        return value === true;
    }

    getNumber(
        context: AccessContext,
        key: string,
    ): number | null {
        const value = this.get(context, key);

        if (typeof value !== "number") {
            return null;
        }

        return value;
    }

    requireEnabled(
        context: AccessContext,
        key: string,
    ): void {
        if (!this.getBoolean(context, key)) {
            throw new InsufficientPermissionsError(
                `Feature is not included in the current service: ${key}`,
            );
        }
    }
}
