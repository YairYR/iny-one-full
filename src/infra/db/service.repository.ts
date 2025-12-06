import { DbInstance } from "@/infra/db/supabase_service";

export function getServiceRepository(db: DbInstance) {
  return {
    async findById(id: string) {
      return db
        .from("services")
        .select("id,name,description,type,active,price,interval,service_gateway,external_service_id,external_plan_id,created_at")
        .eq("id", id)
        .eq("active", true)
        .maybeSingle();
    }
  }
}