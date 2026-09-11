import { DbInstance } from "@/infra/db/supabase_service";
import { UserPlanSummary } from "@/lib/types";

export function getUserRepository(db: DbInstance) {
  return {
    async getCurrentUser() {
      const { data } = await db.auth.getUser();
      const metadata = {
        role: null as string | null,
        plan: null as UserPlanSummary | null,
        timezone: null as string | null,
      };
      const user_metadata = data.user?.user_metadata;
      metadata.role = user_metadata?.user_role ?? null;
      /* INACTIVO: el plan del JWT ya no decide nada (rev. 2026-09-11); ver la nota en
         `UserClient.plan`. El plan efectivo es `AccessContext.planKey`. */
      metadata.plan = user_metadata?.user_plan ?? null;
      metadata.timezone = user_metadata?.user_timezone ?? null;

      return {
        data: {
          user: data.user,
          role: metadata.role,
          /** INACTIVO: sin consumidores (rev. 2026-09-11). */
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

    /**
     * Estado del enlace necesario para editarlo. Las UTM se leen porque
     * `destination` guarda la URL **ya compuesta** con ellas: cambiar el destino
     * sin recomponerlas las perdería en silencio.
     */
    async getLinkForEdit(slug: string) {
      return db
        .from('short_links')
        .select('destination, utm_source, utm_medium, utm_campaign, utm_term, utm_content, utm_id')
        .eq('slug', slug)
        .maybeSingle();
    },

    /**
     * Repunta un enlace ya publicado.
     *
     * Escribe con la sesión del usuario, así que depende de la política
     * `short_links_update_own`. Si esa política faltara, PostgREST devolvería
     * cero filas **sin error** y el cambio se perdería en silencio —que es
     * exactamente lo que le pasó a `changeAlias` durante meses—. Por eso pide
     * las filas afectadas de vuelta: quien llama comprueba que no vengan vacías.
     */
    async changeDestination(slug: string, destination: string) {
      return db
        .from('short_links')
        .update({ destination })
        .eq('slug', slug)
        .select('slug');
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
