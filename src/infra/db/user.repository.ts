import { DbInstance } from "@/infra/db/supabase_service";
import { PlanName } from "@/lib/types";
import { IS_DEVELOPMENT, IS_PRODUCTION } from "@/constants";

export function getUserRepository(db: DbInstance) {
  return {
    async getCurrentUser() {
      const { data } = await db.auth.getUser();
      const metadata = {
        role: null as string | null,
        plan: null as PlanName | null,
        timezone: null as string | null,
      };
      const { data: claims } = await db.auth.getClaims();
      const user_metadata = claims?.claims?.user_metadata;
      metadata.role = user_metadata?.user_role ?? null;
      metadata.plan = user_metadata?.user_plan ?? null;
      metadata.timezone = user_metadata?.user_timezone ?? null;
      /*
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
       */

      return {
        data: {
          user: data.user,
          role: metadata.role,
          plan: metadata.plan,
        }
      };
    },

    /**
     * Una página de links del usuario, con el total para paginar.
     *
     * No embebe `short_links_stats`: esa tabla tiene RLS sin políticas, así que
     * para el rol autenticado el embebido siempre volvía vacío, y nada lo
     * consume desde que `calcUserStats` usa `urls` directamente. Además, al
     * retirar los GRANT por defecto a `authenticated` el embebido pasaría de
     * devolver null a fallar con «permission denied», tumbando el dashboard.
     */
    async getStatsUserUrls(user_id: string, offset = 0, limit = 20) {
      return db
        .from('short_links')
        .select(`
          slug, alias, destination, created_at, utm_source, utm_medium, utm_campaign, clicks
        `, { count: 'exact' })
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    },

    /**
     * Todos los slugs del usuario. Los KPI y las series agregadas se calculan
     * sobre el total, no sobre la página que se esté mostrando.
     */
    async getSlugs(user_id: string) {
      return db
        .from('short_links')
        .select('slug')
        .eq('user_id', user_id);
    },

    /** Links más visitados del usuario, para el KPI y el gráfico de rendimiento. */
    async getTopLinks(user_id: string, limit = 5) {
      return db
        .from('short_links')
        .select('slug, clicks')
        .eq('user_id', user_id)
        .order('clicks', { ascending: false, nullsFirst: false })
        .limit(limit);
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
    },

    /* INACTIVO — sin importaciones ni referencias en el repositorio (rev. 2026-08-09).
     * No se elimina por si retoma uso en una build futura; hoy no tiene efecto en
     * producción. Al reactivarlo: descomentar y cubrirlo con tests. */
    // async findByEmail(email: string) {
    //   return db.from("users_profiles")
    //     .select("*")
    //     .eq("email", email)
    //     .limit(1)
    //     .single();
    // },
    //
    // async getCurrentUserId() {
    //   const { data: { user } } = await db.auth.getUser();
    //   return user?.id ?? null;
    // },
    //
    // /** Listado completo sin paginar. getStatsUserUrls lo sustituyó al paginar la tabla. */
    // async getUrls(user_id: string) {
    //   return db
    //     .from('short_links')
    //     .select('slug, alias, destination, created_at, utm_source, utm_medium, utm_campaign, clicks')
    //     .eq('user_id', user_id);
    // },
  }
}

/** INACTIVO: exportado pero sin referencias en el repositorio (rev. 2026-08-09). */
export type UserRepository = ReturnType<typeof getUserRepository>;
