import db from "@/lib/db";
import { ClientInfo, UserClient, UtmParams } from "@/lib/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const getShortenUrl = async (short: string) => {
  return db
    .from('short_links')
    .select('destination')
    .eq('slug', short)
    .eq('status', true)
    .maybeSingle(); // ✅ Devuelve un solo objeto o null
}

export const getBlockUrl = async (domain: string) => {
  return db
    .schema('security')
    .rpc('is_domain_secure', {
      domain_to_check: domain
    });
}

export const addShortenUrl = async (
  uid: string|null,
  slug: string,
  url: string,
  utm: Partial<UtmParams>,
  domain: string,
  client?: Partial<ClientInfo>
) => {
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
    .select('slug'); // ✅ Solo devuelve el slug para evitar problemas con columnas
}

export const getCurrentUser = async (supabase: SupabaseClient) => {
  const { data } = await supabase.auth.getUser();

  if(data.user) {
    const user: UserClient = {
      email: data.user.email,
      name: data.user.user_metadata?.name ?? data.user.user_metadata?.display_name ?? null,
      picture: data.user.user_metadata?.picture ?? null,
      created_at: data.user.created_at,
    };

    return { user, raw: data.user };
  }

  return { user: null, raw: null };
}

/**
 * __DON'T__ use on critical pages!
 * @param supabase
 */
export const getCurrentUserFromSession = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase.auth.getSession();
  if(error) {
    return null;
  }

  if(data.session?.user) {
    const $user = data.session.user;
    const user: UserClient = {
      email: $user.email,
      name: $user.user_metadata?.name ?? $user.user_metadata?.display_name ?? null,
      picture: $user.user_metadata?.picture ?? null,
      created_at: $user.created_at,
    };

    return user;
  }

  return null;
}

export const getUserUrls = async (uid: string) => {
  return db
    .from('short_links')
    .select('slug, destination, created_at, utm_source, utm_medium, utm_campaign')
    .eq('user_id', uid);
}

export const clickShortLink = async (slug: string, client?: Partial<ClientInfo>) => {
  const agent = client?.userAgent;
  const browser = agent?.browser;
  const device = agent?.device;
  const os = agent?.os;
  return db.schema('public').rpc('click_short_link_2', {
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
}
