import { getPayPalClient, getPaypalSubscription } from "@/lib/paypal";
import { NextRequest, NextResponse } from "next/server";
import { CheckoutPaymentIntent, OrdersController } from "@paypal/paypal-server-sdk";
import { Plan, Subscription } from "@/lib/types";
import {
  createOrder,
  createSubscription,
  getPlanById,
} from "@/lib/utils/query";
import { createClient } from "@/utils/supabase/app-server";
import dayjs from "dayjs";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if(!data.user) {
    // TODO: ERROR
    return;
  }

  const user_id: string = data.user.id;

  let plan!: Plan;

  try {
    const data = await request.json();
    const cart: { id: string, quantity: number }[] = data.cart;
    console.log('cart', cart);

    const planId = cart[0].id;
    const planFound = await getPlanById(planId);
    if(planFound.data) {
     plan = planFound.data;
    } else {
      // TODO: ERROR
      return;
    }
  } catch (err) {
    // TODO: ERROR
  }

  try {
    const client = getPayPalClient();
    const controller = new OrdersController(client);
    const orderPaypal = await controller.createOrder({
      body: {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [
          {
            // payee: {
            //   merchantId: '',
            //   emailAddress: ''
            // },
            softDescriptor: 'Demo Shop',
            description: plan.description ?? undefined,
            amount: {
              currencyCode: plan.currency,
              value: (plan.price).toFixed(2),
            }
          }
        ]
      }
    });

    console.log('order', orderPaypal.result);

    if(!orderPaypal || !orderPaypal.result) {
      // TODO: ERROR
      return;
    }

    const paypalOrderId: string = orderPaypal.result.id as string;

    const now = dayjs();
    const subscription = await createSubscription({
      user_id: user_id,
      service_id: plan.id,
      start_date: now.toDate(),
      // TODO: cuantos días esperar??
      end_date: now.add(36, 'day').toDate(),
      next_billing_date: now.add(31, 'day').toDate(),
    });

    if(! subscription || !subscription.data || !subscription.data[0]) {
      // TODO: ERROR
      return;
    }

    const order = await createOrder({
      user_id: user_id,
      service_id: plan.id,
      subscription_id: subscription.data[0].id,
      amount: plan.price,
      currency: plan.currency,
      description: plan.description ?? undefined,
      payment_gateway: 'paypal',
      external_order_id: paypalOrderId,
    });

    return NextResponse.json({
      id: paypalOrderId,
      order: orderPaypal.result,
      // order_inserted: order.data,
      // subscription: subscription.data,
    });
  } catch (err) {
    // TODO: ERROR
  }
}