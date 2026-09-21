import { DbInstance } from "@/infra/db/supabase_service";

export function getTeamRepository(db: DbInstance) {
  return {
    async getLinkById(linkId: string) {
      return db.from('short_links')
        .select('link_id, team_id, slug, name, destination, clicks, created_at')
        .eq('link_id', linkId)
        .limit(1)
        .maybeSingle();
    },

    /**
     * Una página de links del team, con el total para paginar.
     *
     * No embebe `short_links_stats`: esa tabla tiene RLS sin políticas, así que
     * para el rol autenticado el embebido siempre volvía vacío, y nada lo
     * consume desde que `calcUserStats` usa `urls` directamente. Además, al
     * retirar los GRANT por defecto a `authenticated` el embebido pasaría de
     * devolver null a fallar con «permission denied», tumbando el dashboard.
     */
    async getLinks(teamId: string, offset = 0, limit = 20) {
      return db
        .from('short_links')
        .select(`
          link_id, slug, name, destination, clicks, created_at
        `, { count: 'exact' })
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    },

    /**
     * Todos los link_id del team. Los KPI y las series agregadas se calculan
     * sobre el total, no sobre la página que se esté mostrando.
     */
    async getLinksId(teamId: string) {
      return db.from('short_links')
        .select('link_id')
        .eq('team_id', teamId);
    },

    /** Links más visitados del team, para el KPI y el gráfico de rendimiento. */
    async getTopLinks(teamId: string, limit = 5) {
      return db
        .from('short_links')
        .select('slug, clicks')
        .eq('team_id', teamId)
        .order('clicks', { ascending: false, nullsFirst: false })
        .limit(limit);
    },

    async changeAlias(linkId: string, newAlias: string|null) {
      return db
        .from('short_links')
        .update({ name: newAlias })
        .eq('link_id', linkId);
    },

    /**
     * Estado del enlace necesario para editarlo. Las UTM se leen porque
     * `destination` guarda la URL **ya compuesta** con ellas: cambiar el destino
     * sin recomponerlas las perdería en silencio.
     */
    async getLinkForEdit(linkId: string) {
      return db
        .from('short_links')
        .select('link_id, destination, utms(utm_source, utm_medium, utm_campaign, utm_term, utm_content, utm_id)')
        .eq('link_id', linkId)
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
    async changeDestination(linkId: string, destination: string) {
      return db
        .from('short_links')
        .update({ destination })
        .eq('link_id', linkId)
        .select('link_id');
    },
  };
}