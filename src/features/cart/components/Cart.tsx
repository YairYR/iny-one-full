/* INACTIVO — flujo de pago anterior, sin referencias en el repositorio
 * (rev. 2026-08-23).
 *
 * Ningún componente renderiza `Cart`: la página del carrito usa `CartItem`, y
 * el pago vivo es el de `PricingCards` con `PayPalSubscriptionButton`. Además
 * `PayButtons` llamaba a `/api/checkout/paypal/create-subscription` y
 * `.../capture-subscription`, dos rutas que esta rama eliminó, así que tal cual
 * no funciona.
 *
 * No se borra por si retoma uso. Al reactivarlo: apuntar a `/api/v1/subscription`
 * y `/api/v1/subscription/approve`, y sacar el clientId de PayPal a una variable
 * de entorno en lugar de tenerlo escrito en el fichero.
 */

// 'use client';
//
// import PayButtons from "@/features/payments/components/Paypal/PayButtons";
// import { PayPalScriptProvider } from "@paypal/react-paypal-js";
// import { Plan } from "@/lib/types";
//
// interface Props {
//   plan: Plan;
// }
//
// export default function Cart({ plan }: Readonly<Props>) {
//   return (
//     <>
//       <h1>{plan.name}</h1>
//       <h3>${plan.price} {plan.currency}</h3>
//       <div className="h-screen bg-slate-900 flex items-center justify-center">
//         <PayPalScriptProvider
//           options={{
//             clientId: 'ASaLNO6086Wfq7S3at7exagKgZAYO0Bf12HkUceyb-mNmtU2m5l8W883o_EqGn84e3X_c8KAHcI-dKgU',
//             crossorigin: 'anonymous',
//             components: "buttons",
//             dataSdkIntegrationSource: 'developer-studio',
//             environment: 'sandbox',
//             debug: true,
//             currency: 'USD',
//           }}>
//           <PayButtons planId={plan.id} />
//         </PayPalScriptProvider>
//       </div>
//     </>
//   )
// }
