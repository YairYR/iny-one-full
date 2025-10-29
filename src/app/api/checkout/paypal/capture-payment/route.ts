import { getPayPalClient, getPaypalProduct, PaypalProduct } from "@/lib/paypal";
import { NextRequest, NextResponse } from "next/server";
import { CheckoutPaymentIntent, OrdersController, PaymentsController } from "@paypal/paypal-server-sdk";

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
  const controller = new PaymentsController(client);
  const payment = await controller.getCapturedPayment({
    captureId: orderId,
  });

  return NextResponse.json({
    payment: payment,
  });
}