import { DbInstance } from "@/infra/db/supabase_service";
import { jwtDecode, JwtPayload } from "jwt-decode";

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

      const { data: { session } } = await db.auth.getSession();
      const jwt = session ? jwtDecode<SessionDecoded>(session.access_token) : null;

      return {
        data: {
          user,
          role: jwt?.user_role ?? null
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

    async changeAlias(slug: string, newAlias: string|null) {
      // TODO: validar que el alias no esté en uso (?
      // TODO: validar que el link le pertenezca al user
      return db
        .from('short_links')
        .update({ alias: newAlias })
        .eq('slug', slug);
    }
  }
}

interface SessionDecoded extends JwtPayload {
  user_role: string|null;
}