import { DbInstance } from "@/infra/db/supabase_service";
import { ClientInfo, UtmParams } from "@/lib/types";

export function getShorterRepository(db: DbInstance) {
  return {
    async create(
      uid: string | null,
      slug: string,
      url: string,
      utm: Partial<UtmParams>,
      domain: string,
      client?: Partial<ClientInfo>
    ) {
      return db
        .from('short_links')
        .insert([
          {
            slug,
            destination: url,
            utm_source: utm?.source ?? null,
            utm_medium: utm?.medium ?? null,
            utm_campaign: utm?.campaign ?? null,
            utm_term: utm?.term ?? null,
            utm_content: utm?.content ?? null,
            utm_id: utm?.id ?? null,
            user_id: uid ?? null,
            ip_user: client?.ip ?? null,
            country_code_user: client?.countryCode ?? null,
            domain: domain ?? null,
          },
        ])
        .select('slug');
    },

    async getBySlug(slug: string) {
      return db
        .from('short_links')
        .select('destination, expires_at')
        .eq('slug', slug)
        .eq('status', true)
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
    }
  }
}