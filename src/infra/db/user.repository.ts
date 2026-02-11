import { DbInstance } from "@/infra/db/supabase_service";
import { PlanName } from "@/lib/types";
import { IS_DEVELOPMENT, IS_PRODUCTION } from "@/constants";

export function getUserRepository(db: DbInstance) {
  return {
    async findByEmail(email: string) {
      return db.from("users_profiles")
        .select("*")
        .eq("email", email)
        .limit(1)
        .single();
    },

    async getCurrentUser() {
      const { data: { user } } = await db.auth.getUser();
      const metadata = {
        role: null as string | null,
        plan: null as PlanName | null,
        timezone: null as string | null,
      };
      if(IS_PRODUCTION) {
        const { data: claims } = await db.auth.getClaims();
        const user_metadata = claims?.claims?.user_metadata;
        metadata.role = user_metadata?.user_role ?? null;
        metadata.plan = user_metadata?.user_plan ?? null;
        metadata.timezone = user_metadata?.user_timezone ?? null;
      }
      else if(IS_DEVELOPMENT && user) {
        const profileResponse = await db.from('users_profiles')
          .select('plan, timezone')
          .eq('id', user.id)
          .limit(1);

        if(profileResponse.data && profileResponse.data.length > 0) {
          metadata.plan = profileResponse.data[0].plan as PlanName;
          metadata.timezone = profileResponse.data[0].timezone;
        }

        const roleResponse = await db.from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .limit(1);

        if(roleResponse.data && roleResponse.data.length > 0) {
          metadata.role = roleResponse.data[0].role;
        }
      }

      return {
        data: {
          user: user,
          role: metadata.role,
          plan: metadata.plan,
        }
      };
    },

    async getCurrentUserId() {
      const { data: { user } } = await db.auth.getUser();
      return user?.id ?? null;
    },

    async getStatsUserUrls(user_id: string) {
      return db
        .from('short_links')
        .select(`
          slug, alias, destination, created_at, utm_source, utm_medium, utm_campaign, clicks,
          stats:short_links_stats(*)
        `)
        .eq('user_id', user_id)
        .limit(20);
    },

    async getUrls(user_id: string) {
      return db
        .from('short_links')
        .select('slug, alias, destination, created_at, utm_source, utm_medium, utm_campaign, clicks')
        .eq('user_id', user_id);
    },

    async isOwner(user_id: string, slug: string) {
      return db
        .from('short_links')
        .select('slug')
        .eq('slug', slug)
        .eq('user_id', user_id)
        .limit(1)
        .single();
    },

    async changeAlias(slug: string, newAlias: string|null) {
      return db
        .from('short_links')
        .update({ alias: newAlias })
        .eq('slug', slug);
    }
  }
}

export type UserRepository = ReturnType<typeof getUserRepository>;
