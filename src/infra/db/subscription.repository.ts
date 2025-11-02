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
  }
}

export type SubscriptionStatus = 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
