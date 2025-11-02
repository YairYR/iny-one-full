import supabase from "@/infra/db/supabase";

export const PaymentRepository = {
  async findById(id: string) {
    return supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .limit(1)
      .maybeSingle();
  },

  async findAllByOderId(order_id: string) {
    return supabase
      .from("payments")
      .select("*")
      .eq("order_id", order_id);
  }
}