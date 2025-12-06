import { redirect } from "next/navigation";
import { isLoggedIn } from "@/data/dto/user-dto";
import { CartItem, ICartItem } from "@/features/cart/components/CartItem";
import { supabase_service } from "@/infra/db/supabase_service";
import { createServicesRepository } from "@/infra/db/services.repository";
import { cookies } from "next/headers";
import { uuid as zUuid } from 'zod/mini';
import { CART_COOKIE_NAME } from "@/constants";

interface Props {
  params: Promise<{ checkout?: string[] }>;
}

const checkUuid = zUuid();

export default async function CartCheckoutPage({ params }: Readonly<Props>) {
  const { checkout } = await params;
  let service_id = checkout?.[0];

  const cookieList = await cookies();
  if(cookieList.has(CART_COOKIE_NAME)) {
    service_id = cookieList.get(CART_COOKIE_NAME)?.value;
  }

  const logged = await isLoggedIn();
  if(!logged) {
    return redirect('/auth/login');
  }

  if(!service_id || !checkUuid.safeParse(service_id).success) {
    return redirect('/#subscriptions');
  }

  const servicesRepo = createServicesRepository(supabase_service);
  const { data: plan, error } = await servicesRepo.getPlanById(service_id);

  if(!plan || error) {
    return redirect('/plans');
  }

  const isEmpty = false;
  const item: ICartItem = {
    id: '',
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    symbol: '$',
    interval: 'month'
  };

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
          <span>$9.990</span>
        </div>

        <div className="flex justify-between text-gray-900 text-lg font-bold mt-2">
          <span>Total</span>
          <span>$9.990</span>
        </div>
      </div>

      {/* Checkout */}
      <button className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 rounded-xl transition">
        Continuar al pago
      </button>
    </div>
  );
}
