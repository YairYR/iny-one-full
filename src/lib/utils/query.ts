import db from "@/lib/db";

export const getShortenUrl = async (short: string) => {
  return db
    .from('short_links')
    .select('id, destination') // ✅ Incluimos id para analytics
    .eq('slug', short)
    .limit(1)
    .single(); // ✅ Directamente un objeto
};

export const getBlockUrl = async (domain: string) => {
  return db
    .schema('security')
    .rpc('is_domain_secure', {
      domain_to_check: domain
    });
};

export const addShortenUrl = async (
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
        user_id: null, // pública por ahora
        ip_user: client?.ip ?? null,
        country_code_user: client?.countryCode ?? null,
        domain: domain ?? null,
      },
    ])
    .select('id, slug') 
    .single();          
};

interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
}

interface ClientInfo {
  ip: string | null;
  countryCode: string | null;
}

