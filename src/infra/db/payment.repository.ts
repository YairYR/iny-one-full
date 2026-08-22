/* INACTIVO — sin importaciones ni referencias en el repositorio (rev. 2026-08-09).
 * No se elimina por si retoma uso en una build futura; hoy no tiene efecto en
 * producción. Al reactivarlo: descomentar y cubrirlo con tests.
 * Repositorio de pagos individuales: ninguna ruta lo instancia. */

// import { DbInstance } from "@/infra/db/supabase_service";
//
// export function getPaymentRepository(db: DbInstance) {
//   return {
//     async findById(id: string) {
//       return db
//         .from("payments")
//         .select("*")
//         .eq("id", id)
//         .limit(1)
//         .maybeSingle();
//     },
//
//     async findAllByOderId(order_id: string) {
//       return db
//         .from("payments")
//         .select("*")
//         .eq("order_id", order_id);
//     }
//   }
// }
