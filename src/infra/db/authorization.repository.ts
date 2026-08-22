import 'server-only';
import { createClient } from "@/lib/supabase/server";
import {ApiError} from "@/lib/api/errors";

export class AuthorizationRepository {
    async getUserRoles(userId: string) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("user_roles")
            .select(`
        role:roles (
          id,
          key
        )
      `)
            .eq("user_id", userId);

        if (error) {
            throw new Error(
                `Failed to load user roles: ${error.message}`
            );
        }

        return data ?? [];
    }

    async getRolePermissions(roleIds: string[]) {
        if (roleIds.length === 0) {
            return [];
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from("role_permissions")
            .select(`
        permission:permissions (
          id,
          key
        )
      `)
            .in("role_id", roleIds);

        if (error) {
            throw new Error(
                `Failed to load permissions: ${error.message}`
            );
        }

        return data ?? [];
    }

    async getSubscription(userId: string) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("subscriptions")
            .select(`
        id,
        status,
        start_date,
        end_date,
        service_id
      `)
            .eq("user_id", userId)
            .maybeSingle();

        if (error) {
            throw new Error(
                `Failed to load subscription: ${error.message}`
            );
        }

        return data;
    }

    async getFreeService() {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("services")
            .select("id, name")
            .eq("service_gateway", "internal")
            .eq("name", "FREE")
            .eq("active", true)
            .single();

        if (error) {
            throw new ApiError(
                "UWU",
                `Free service is not configured: ${error.message}`
            );
        }

        return data;
    }

    async getServiceEntitlements(serviceId: string) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("service_entitlements")
            .select("key, value")
            .eq("service_id", serviceId);

        if (error) {
            throw new Error(
                `Failed to load service entitlements: ${error.message}`
            );
        }

        return data ?? [];
    }
}
