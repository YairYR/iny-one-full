import { type DbInstance } from "@/infra/db/supabase_service";
import { TablesInsert } from "@/lib/types/db.types";

export function getOrderRepository(db: DbInstance) {
  return {
    async findById(id: string) {
      return db
        .from("orders")
        .select("*")
        .eq("id", id)
        .limit(1)
        .maybeSingle();
    },
    async findByExternalId(id: string, gateway: string) {
      return db
        .from("orders")
        .select("*")
        .eq("external_order_id", id)
        .eq("payment_gateway", gateway)
        .limit(1)
        .maybeSingle();
    },
    async create(order: Omit<TablesInsert<'orders'>, 'id'|'created_at'>) {
      return db
        .from("orders")
        .insert(order)
        .select();
    },
    async findPendingByUserId(user_id: string, service_id?: string) {
        let query = db
            .from("orders")
            .select("*, services(name,description,price,currency,type,interval,external_service_id)")
            .eq("user_id", user_id)
            .eq("status", "pending")
            .eq("payment_gateway", "paypal")
            .or("expires_at.is.null,expires_at.gt.now()");

        if (service_id) {
          query = query.eq("service_id", service_id);
        }

        return query.maybeSingle();
    },

      async updateStatusToExpired(user_id: string, service_id: string) {
        return db.from('orders')
          .update({ status: 'expired' })
          .eq('user_id', user_id)
          .eq('service_id', service_id)
          .eq('status', 'pending');
      }
  }
}

/**
 *
 * Order Status:
 *
 * pending
 * completed
 * failed
 * refunded
 * cancelled
 * expired
 *
 */