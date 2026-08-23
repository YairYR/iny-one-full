import { supabase_service } from "@/infra/db/supabase_service";
import { Subscription } from "@/lib/entities";

/**
 * Repositorio para la tabla subscriptions.
 * Almacena el estado vigente actual de la suscripción del usuario (UNIQUE por user_id).
 * Estados: ACTIVE, SUSPENDED, CANCELLED, EXPIRED
 */
export const SubscriptionRepository = {
  async findById(id: string) {
    return supabase_service
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
  },

  /**
   * Retorna la suscripción actual del usuario (solo puede tener una)
   */
  async findByUserId(user_id: string) {
    return supabase_service
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();
  },

  /**
   * Retorna la suscripción si está activa
   */
  async findActiveByUserId(user_id: string) {
    return supabase_service
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .eq("status", "ACTIVE")
      .maybeSingle();
  },

  /**
   * Filtra suscripciones por estado específico
   */
  async findByStatus(status: SubscriptionStatus) {
    return supabase_service
      .from("subscriptions")
      .select("*")
      .eq("status", status);
  },

  async create(subscription: Subscription) {
    return supabase_service
      .from("subscriptions")
      .insert(subscription)
      .select()
      .maybeSingle();
  },

  /**
   * Crea o actualiza la suscripción del usuario (UNIQUE por user_id)
   */
  async upsert(subscription: Partial<Subscription>) {
    return supabase_service
      .from("subscriptions")
        // @ts-expect-error La suscripción se valida antes
      .upsert(subscription, {
        onConflict: "user_id",
        ignoreDuplicates: false,
      })
      .select()
      .maybeSingle();
  },

  async updateById(id: string, subscription: Partial<Subscription>) {
    return supabase_service
      .from("subscriptions")
      .update({
        ...subscription,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .maybeSingle();
  },

  async updateByUserId(user_id: string, subscription: Partial<Subscription>) {
    return supabase_service
      .from("subscriptions")
      .update({
        ...subscription,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .select()
      .maybeSingle();
  },

  async updateByExternalId(
    external_id: string,
    gateway: string,
    subscription: Partial<Subscription>
  ) {
    return supabase_service
      .from("subscriptions")
      .update({
        ...subscription,
        updated_at: new Date().toISOString(),
      })
      .eq("external_subscription_id", external_id)
      .eq("subscription_gateway", gateway)
      .select()
      .maybeSingle();
  },
};

export type SubscriptionStatus = "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED";
