/* INACTIVO — sin importaciones ni referencias en el repositorio (rev. 2026-08-09).
 * No se elimina por si retoma uso en una build futura; hoy no tiene efecto en
 * producción. Al reactivarlo: descomentar y cubrirlo con tests.
 * Repositorio de órdenes: el flujo de pago vigente sólo escribe suscripciones. */

// import { type DbInstance } from "@/infra/db/supabase_service";
// import { Order } from "@/lib/entities";
//
// export function getOrderRepository(db: DbInstance) {
//   return {
//     async findById(id: string) {
//       return db
//         .from("orders")
//         .select("*")
//         .eq("id", id)
//         .limit(1)
//         .maybeSingle();
//     },
//     async findByExternalId(id: string, gateway: string) {
//       return db
//         .from("orders")
//         .select("*")
//         .eq("external_order_id", id)
//         .eq("payment_gateway", gateway)
//         .limit(1)
//         .maybeSingle();
//     },
//     async create(order: Omit<Order, 'id'|'created_at'>) {
//       return db
//         .from("orders")
//         .insert(order)
//         .select();
//     },
//   }
// }
