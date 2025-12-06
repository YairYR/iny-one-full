import { DbInstance } from "@/infra/db/supabase_service";

export function getPaymentRepository(db: DbInstance) {
  return {
    async findById(id: string) {
      return db
        .from("payments")
        .select("*")
        .eq("id", id)
        .limit(1)
        .maybeSingle();
    },

    async findAllByOderId(order_id: string) {
      return db
        .from("payments")
        .select("*")
        .eq("order_id", order_id);
    }
  }
}