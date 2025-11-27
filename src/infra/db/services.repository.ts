import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/db.types";

export function createServicesRepository(db: SupabaseClient<Database>) {
  return {
    async getPlans() {
      return db
        .from('services')
        .select('id, name, description, type, price, currency, interval')
        .eq('active', true)
        .eq('type', 'subscription')
        .order('price', { ascending: true });
    },

    async getPlanById(id: string) {
      return db
        .from('services')
        .select(`
        id,
        name,
        description,
        type,
        price,
        currency,
        interval,
        service_gateway,
        external_service_id`)
        .eq('active', true)
        .eq('type', 'subscription')
        .eq('id', id)
        .maybeSingle();
    }
  }
}