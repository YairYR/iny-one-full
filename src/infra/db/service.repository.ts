import supabase from "@/infra/db/supabase";

export const ServiceRepository = {
  async findById(id: string) {
    return supabase
      .from("services")
      .select("id,name,description,type,active,price,interval,service_gateway,external_service_id,external_plan_id,created_at")
      .eq("id", id)
      .eq("active", true)
      .maybeSingle();
  }
}