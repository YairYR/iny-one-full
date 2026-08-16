import { supabase_service } from "@/infra/db/supabase_service";
import {TablesInsert, TablesUpdate} from "@/lib/types/db.types";

export const SubscriptionRequestsRepository = {
  /**
   * Crea una nueva solicitud de suscripción
   */
  async create(request: TablesInsert<'subscription_requests'>) {
    return supabase_service
      .from("subscription_requests")
      .insert(request)
      .select()
      .maybeSingle();
  },

  /**
   * Busca una solicitud por ID
   */
  async findById(id: string) {
    return supabase_service
      .from("subscription_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();
  },

  /**
   * Busca solicitudes pendientes recientes del usuario
   * @param user_id ID del usuario
   * @param max_age_hours Antigüedad máxima en horas (por defecto 1)
   */
  async findPendingByUser(user_id: string, max_age_hours: number = 1) {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - max_age_hours);
    
    return supabase_service
      .from("subscription_requests")
      .select("*")
      .eq("user_id", user_id)
      .in("status", ["APPROVAL_PENDING"])
      .gte("created_at", cutoffDate.toISOString())
      .order("created_at", { ascending: false });
  },

  /**
   * Busca una solicitud por external_subscription_id de PayPal
   */
  async findByExternalId(external_subscription_id: string, user_id?: string) {
    let query = supabase_service
      .from("subscription_requests")
      .select("*")
      .eq("external_subscription_id", external_subscription_id);
    
    if (user_id) {
      query = query.eq("user_id", user_id);
    }
    
    return query.maybeSingle();
  },

  /**
   * Actualiza el estado de una solicitud
   */
  async updateStatus(
    id: string,
    status: RequestStatus,
    external_subscription_id?: string
  ) {
    const update: TablesUpdate<'subscription_requests'> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (external_subscription_id) {
      update.external_subscription_id = external_subscription_id;
    }

    return supabase_service
      .from("subscription_requests")
      .update(update)
      .eq("id", id);
  },

  /**
   * Vincula una solicitud con la suscripción activa creada
   */
  async updateSubscriptionId(request_id: string, subscription_id: string) {
    return supabase_service
      .from("subscription_requests")
      .update({
        subscription_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", request_id);
  },
};

// Tipos para las solicitudes de suscripción
export type RequestType = "new" | "upgrade" | "downgrade" | "reactivate";

export type RequestStatus =
  | "INSERTED"
  | "APPROVAL_PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "REJECTED"
  | "EXPIRED";

export interface SubscriptionRequest {
  id: string;
  user_id: string;
  service_id: string;
  request_type: RequestType;
  status: RequestStatus;
  subscription_gateway: string;
  external_subscription_id: string | null;
  subscription_id: string | null;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown> | null;
}
