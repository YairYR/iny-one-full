import {redirect} from "next/navigation";
import {getCurrentUserDTO} from "@/data/dto/user-dto";
import { CartItem, ICartItem } from "@/features/cart/components/CartItem";
import { supabase_service } from "@/infra/db/supabase_service";
import { ROUTES } from "@/lib/routes";
import {getOrderRepository} from "@/infra/db/order.repository";
import {PayPalSubscriptionButton} from "@paypal/react-paypal-js/sdk-v6";
import {ErrorResponse, SuccessResponse} from "@/lib/types/api";
import {ERROR} from "@/lib/api/error-codes";
import {actionApproveSubscription, actionCreateSubscription} from "@/features/payments/actions/actions";

export default async function CartCheckoutPage() {
  const user = await getCurrentUserDTO();
  if(!user) {
    return redirect(ROUTES.LOGIN);
  }

  async function getOrderPending() {
    'use server';
    const ordersRepo = getOrderRepository(supabase_service);
    const { data, error } = await ordersRepo.findPendingByUserId(user!.id);
    if (error || !data) {
      console.log(error);
      return null;
    }
    return {
      id: data.id,
      status: data.status,
      service: data.services,
      created_at: data.created_at,
      expires_at: data.expires_at,
    };
    // return data;
  }

  const order = await getOrderPending();

  console.log('order', order);

  if(!order) {
    return redirect(ROUTES.PLANS);
  }

  const isEmpty = false;
  const item: ICartItem = {
    id: order.id,
    name: order.service?.name ?? '',
    description: order.service?.description ?? '',
    price: order.service?.price ?? 0,
    currency: order.service?.currency ?? '',
    symbol: '$',
    interval: order.service?.interval ?? '',
  };

  // const createSubscription = async (planId: string) => {
  //   const resp: SuccessResponse<{ subscriptionId: string }>|ErrorResponse = await fetch('/api/v1/subscription', {
  //     method: "POST",
  //     body: JSON.stringify({
  //       planId: planId,
  //     })
  //   }).then((res) => res.json());
  //
  //   if (resp.ok) {
  //     return {
  //       subscriptionId: resp.data.subscriptionId,
  //     }
  //   }
  //
  //   if (resp.error.code === ERROR.SESSION_NOT_FOUND) {
  //     // addCookie('_redirect_to', `${ROUTES.PLANS}#plan=${planId}`);
  //     return redirect(ROUTES.LOGIN);
  //   }
  //
  //   if (resp.error.code === ERROR.PLAN_ALREADY) {
  //     return redirect(ROUTES.DASHBOARD);
  //   }
  //
  //   alert('Error creating new subscription');
  // }

  const createSubscription = async () => {
    'use server';
    const resp = await actionCreateSubscription();
    console.log('resp', resp);
    return resp;
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-md space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tu Carrito</h2>
        <p className="text-gray-500 text-sm">Revisa tu plan antes de continuar</p>
      </div>

      {/* Carrito vacío */}
      {isEmpty && (<div className="flex flex-col items-center py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5"
               viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-6-4h.01"/>
          </svg>
        </div>
        <p className="mt-4 text-gray-600">Tu carrito está vacío.</p>
      </div>)}

      <CartItem item={item} />

      {/*/!* Item del carrito *!/*/}
      {/*<div className="flex items-start gap-4 border rounded-xl p-4">*/}
      {/*  <div className="flex-1">*/}
      {/*    <h3 className="text-lg font-semibold text-gray-900">Plan Premium</h3>*/}
      {/*    <p className="text-sm text-gray-500">Acceso ilimitado a todas las funciones</p>*/}

      {/*    <div className="mt-3">*/}
      {/*      <span className="text-gray-700 font-medium">$9.990 / mes</span>*/}
      {/*    </div>*/}
      {/*  </div>*/}

      {/*  /!* Botón eliminar *!/*/}
      {/*  <button className="text-red-500 hover:text-red-600 transition">*/}
      {/*    <svg className="w-6 h-6" fill="none" stroke="currentColor"*/}
      {/*         strokeWidth="1.5" viewBox="0 0 24 24">*/}
      {/*      <path strokeLinecap="round" strokeLinejoin="round"*/}
      {/*            d="M6 18L18 6M6 6l12 12" />*/}
      {/*    </svg>*/}
      {/*  </button>*/}
      {/*</div>*/}

      {/* Totales */}
      <div className="border-t pt-4">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal</span>
          <span>{item.symbol}{item.price}</span>
        </div>

        <div className="flex justify-between text-gray-900 text-lg font-bold mt-2">
          <span>Total</span>
          <span>{item.symbol}{item.price}</span>
        </div>
      </div>

      {/* Checkout */}
      {/*<button className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 rounded-xl transition">*/}
      {/*  Continuar al pago*/}
      {/*</button>*/}

      <div className="flex justify-between text-gray-700">
        {order && (
            <PayPalSubscriptionButton

              createSubscription={createSubscription}
              onApprove={actionApproveSubscription}
            />
        )}
      </div>
    </div>
  );
}
