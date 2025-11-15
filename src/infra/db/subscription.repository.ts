import supabase from "@/infra/db/supabase";
import { Subscription } from "@/core/entities";

export const SubscriptionRepository = {
  async findById(id: string) {
    return supabase
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .limit(1)
      .maybeSingle();
  },

  async findAllByUserId(user_id: string) {
    return supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id);
  },

  async findAllActiveByUserId(user_id: string) {
    return supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .eq("status", "ACTIVE");
  },

  async findAllByUserAndStatus(user_id: string, status: SubscriptionStatus[]) {
    return supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .in('status', status)
      .order('created_at', { ascending: false });
  },

  async generateUniqueUUID() {
    return supabase
      .rpc("generate_unique_uuid", {
        p_table: 'subscriptions',
        p_col: 'id'
      });
  },

  async create(subscription: Partial<Subscription>) {
    return supabase
      .from("subscriptions")
      .insert(subscription)
      .select();
  },

  async updateById(id: string, subscription: Partial<Subscription>) {
    return supabase
      .from("subscriptions")
      .update(subscription)
      .eq('id', id);
  },

  async updateByExternalId(id: string, gateway: string, subscription: Partial<Subscription>) {
    return supabase
      .from("subscriptions")
      .update(subscription)
      .eq('external_subscription_id', id)
      .eq('subscription_gateway', gateway);
  },
}

export type SubscriptionStatus = 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
