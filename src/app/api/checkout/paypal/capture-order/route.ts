import { getPayPalClient } from "@/lib/paypal";
import { OrdersController } from "@paypal/paypal-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let orderId!: string;
  try {
    const data = await request.json();
    orderId = data.orderID;
    console.log('orderId', orderId);

    if(! orderId || typeof orderId !== 'string') {
      // TODO: ERROR
      return;
    }
  } catch (err) {
    // TODO: ERROR
  }

  const client = getPayPalClient();
  const controller = new OrdersController(client);
  const order = await controller.captureOrder({
    id: orderId,
  }).catch(console.error);

  if(order && order.result) {
    console.log('order', order.result);
    return NextResponse.json({
      id: order.result.id,
      order: order.result
    });
  }

  console.log('order [ERROR]', order);

  // TODO: ERROR
}