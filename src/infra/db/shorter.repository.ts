import { DbInstance } from "@/infra/db/supabase_service";
import { ClientInfo, UrlExpires, UtmValues } from "@/lib/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// dayjs es un singleton: extender aquí garantiza que `.utc()` esté disponible
// aunque este repositorio se importe sin pasar antes por una ruta que lo extienda.
dayjs.extend(utc);

export type CreateShortLinkInput = {
  userId: string | null;
  slug: string;
  destination: string;
  utm: Partial<UtmValues>;
  domain: string;
  expires?: UrlExpires;
  client?: Partial<ClientInfo>;
};

export function getShorterRepository(db: DbInstance) {
  return {
    async create({ userId, slug, destination, utm, domain, expires, client }: CreateShortLinkInput) {
      return db
        .from('short_links')
        .insert([
          {
            slug,
            destination,
            utm_source: utm?.source ?? null,
            utm_medium: utm?.medium ?? null,
            utm_campaign: utm?.campaign ?? null,
            utm_term: utm?.term ?? null,
            utm_content: utm?.content ?? null,
            utm_id: utm?.id ?? null,
            user_id: userId ?? null,
            ip_user: client?.ip ?? null,
            country_code_user: client?.countryCode ?? null,
            domain: domain ?? null,
            expires_in: expires?.expires_in_days ?? null,
            expires_at: expires?.expires_at ?? null,
          },
        ])
        .select('slug');
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

    async setStatus(slug: string, status: boolean) {
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
          user_device_type: device?.type ?? null,
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
        .eq('user_id', userId)
        .gte('created_at', oneMonthAgo.toISOString());
    }
  }
}

export type ShorterRepository = ReturnType<typeof getShorterRepository>;
