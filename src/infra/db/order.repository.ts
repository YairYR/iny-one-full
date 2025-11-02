import supabase from "@/infra/db/supabase";
import { Order } from "@/core/entities";

export const OrderRepository = {
  async findById(id: string) {
    return supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .limit(1)
      .maybeSingle();
  },
  async findByExternalId(id: string, gateway: string) {
    return supabase
      .from("orders")
      .select("*")
      .eq("external_order_id", id)
      .eq("payment_gateway", gateway)
      .limit(1)
      .maybeSingle();
  },
  async create(order: Omit<Order, 'id'|'created_at'>) {
    return supabase
      .from("orders")
      .insert(order)
      .select();
  },
}