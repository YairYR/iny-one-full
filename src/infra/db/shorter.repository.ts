import { DbInstance } from "@/infra/db/supabase_service";
import { ClientInfo, UrlExpires, UtmValues } from "@/lib/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Tables } from "@/lib/types/db.types";

// dayjs es un singleton: extender aquí garantiza que `.utc()` esté disponible
// aunque este repositorio se importe sin pasar antes por una ruta que lo extienda.
dayjs.extend(utc);

export type CreateShortLinkInput = {
  userId: string | null;
  teamId?: string | null;
  hostId?: string | null;
  slug: string;
  destination: string;
  utm: Partial<UtmValues>;
  domain: string;
  expires?: UrlExpires;
  client?: Partial<ClientInfo>;
};

export function getShorterRepository(db: DbInstance) {
  return {
    async create({ userId, teamId, hostId, slug, destination, utm, domain, expires, client }: CreateShortLinkInput) {
      // return db
      //   .from('short_links')
      //   .insert([
      //     {
      //       slug,
      //       destination,
      //       host_id: hostId ?? null,
      //       team_id: teamId ?? null,
      //       created_by: userId ?? null,
      //       created_by_ip: client?.ip ?? null,
      //       created_by_country_code: client?.countryCode ?? null,
      //       expires_in: expires?.expires_in_days ?? null,
      //       expires_at: expires?.expires_at ?? null,
      //       utms: {
      //         utm_source: utm?.source ?? null,
      //         utm_medium: utm?.medium ?? null,
      //         utm_campaign: utm?.campaign ?? null,
      //         utm_term: utm?.term ?? null,
      //         utm_content: utm?.content ?? null,
      //         utm_id: utm?.id ?? null,
      //       },
      //       // link_destinations: (domain ? { domain: domain ?? null } : undefined),
      //     },
      //   ])
      //   .select('slug');

      const created_by_ip = (client?.ip && client.ip !== '::1') ? client.ip : null;
      const created_by_country_code = client?.countryCode ?? null;

      // @ts-expect-error Needs to map DB types to RPC params
      return db.rpc('create_link', {
        p_team_id: teamId ?? null,
        p_host_id: hostId ?? null,
        p_slug: slug,
        p_destination: destination,
        p_domain: domain ?? null,
        p_subdomain: null,
        p_created_by: userId ?? null,
        p_created_by_ip: created_by_ip,
        p_created_by_country_code: created_by_country_code,
        p_name: null,
        p_utm_source: utm?.source ?? null,
        p_utm_medium: utm?.medium ?? null,
        p_utm_campaign: utm?.campaign ?? null,
        p_utm_content: utm?.content ?? null,
        p_utm_term: utm?.term ?? null,
        p_utm_id: utm?.id ?? null,
        p_expires_in: expires?.expires_in_days ?? null,
      });
    },

    /**
     * No filtra por `status`: lo devuelve para que el resolver pueda distinguir
     * un enlace caducado de uno inexistente y mostrar cada pantalla. Filtrarlo
     * hacía que, tras la primera visita a un caducado, la fila desapareciera de
     * la consulta y ambos casos quedaran indistinguibles.
     */
    async getBySlug(slug: string) {
      return db
        .from('short_links')
        .select('destination, expires_at, status')
        .eq('slug', slug)
        .maybeSingle();
    },

    async setStatus(slug: string, status: Tables<'short_links'>['status']) {
      return db
        .from('short_links')
        .update({ status })
        .eq('slug', slug);
    },

    async click(slug: string, client?: Partial<ClientInfo>) {
      const agent = client?.userAgent;
      const browser = agent?.browser;
      const device = agent?.device ?? { type: 'desktop' };
      const os = agent?.os;
      return db
        .schema('public')
        .rpc('click_short_link', {
          page_slug: slug,
          user_ip: client?.ip ?? null,
          user_country_code: client?.countryCode ?? null,
          user_region: client?.region ?? null,
          user_city: client?.city ?? null,
          user_latitude: client?.latitude ?? null,
          user_longitude: client?.longitude ?? null,
          user_ua: client?.userAgent?.ua ?? null,
          user_is_bot: agent?.isBot ?? false,
          user_browser: browser?.name ?? null,
          user_browser_version: browser?.major ?? browser?.version ?? null,
          user_device_type: device?.type ?? 'desktop',
          user_device_vendor: device?.vendor ?? null,
          user_device_model: device?.model ?? null,
          user_os: os?.name ?? null,
          user_os_version: os?.version ?? null,
          user_referer: client?.referer ?? null,
        });
    },

    async isSafeDomain(domain: string) {
      return db
        .schema('security')
        .rpc('is_domain_secure', {
          domain_to_check: domain
        });
    },

    async countLinksByIpInLastMonth(ip: string) {
      const oneMonthAgo = dayjs().utc().subtract(1, 'month');

      return db
        .from('short_links')
        .select('slug', { count: 'exact', head: true })
        .eq('ip_user', ip)
        .is('user_id', null) // solo usuarios no logueados
        .gte('created_at', oneMonthAgo.toISOString());
    },

    async countLinksByUserInLastMonth(userId: string) {
      const oneMonthAgo = dayjs().utc().subtract(1, 'month');

      return db
        .from('short_links')
        .select('slug', { count: 'exact', head: true })
        .eq('created_by', userId)
        .gte('created_at', oneMonthAgo.toISOString());
    },

    /**
     * Registra que un enlace cambió de destino.
     *
     * Repuntar un enlace muy compartido es el vector para convertir uno legítimo
     * en malicioso, así que deja rastro. Se escribe con el service role a
     * propósito: la tabla tiene RLS sin políticas, de modo que el propio usuario
     * no puede leer ni falsear su historial.
     */
    async logDestinationChange(entry: {
      link_id: string;
      oldDestination: string;
      newDestination: string;
      changedBy: string;
    }) {
      return db
        .from('short_link_destination_changes')
        .insert([{
          link_id: entry.link_id,
          old_destination: entry.oldDestination,
          new_destination: entry.newDestination,
          changed_by: entry.changedBy,
        }]);
    }
  }
}

export type ShorterRepository = ReturnType<typeof getShorterRepository>;
