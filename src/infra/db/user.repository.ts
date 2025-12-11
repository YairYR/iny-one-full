import { DbInstance } from "@/infra/db/supabase_service";

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
      const { data: claims } = await db.auth.getClaims();

      return {
        data: {
          user: user,
          role: claims?.claims?.user_role ?? null
        }
      };
    },

    async getCurrentUserId() {
      const { data: { user } } = await db.auth.getUser();
      return user?.id ?? null;
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
