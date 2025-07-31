import db from "@/lib/db";

export const getShortenUrl = async (short: string) => {
  return db.from('short_links')
            .select('destination')
            .eq('slug', short)
            .limit(1);
}

export const getBlockUrl = async (domain: string) => {
  return db.schema('security')
           .rpc('is_domain_secure', {
             domain_to_check: domain
           });
}

export const addShortenUrl = async (slug: string, url: string, utm: Partial<UtmParams>) => {
  return db.from('short_links')
            .insert([
              {
                slug,
                destination: url,
                utm_source: utm?.source ?? null,
                utm_medium: utm?.medium ?? null,
                utm_campaign: utm?.campaign ?? null,
                user_id: null, // pública por ahora
              },
            ]);
}

interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
}