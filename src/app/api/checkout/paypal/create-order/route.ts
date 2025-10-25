import { getPayPalClient, getPaypalProduct, PaypalProduct } from "@/lib/paypal";
import { NextRequest, NextResponse } from "next/server";
import { CheckoutPaymentIntent, OrdersController } from "@paypal/paypal-server-sdk";

export async function POST(request: NextRequest) {
  let product!: PaypalProduct;

  try {
    const data = await request.json();
    const cart: { id: string, quantity: number }[] = data.cart;
    console.log('cart', cart);

    const productId = cart[0].id;
    const productFound = await getPaypalProduct(productId);
    if(productFound.result) {
     product = productFound.result;
    } else {
      // TODO: ERROR
      return;
    }
  } catch (err) {
    // TODO: ERROR
  }

  const client = getPayPalClient();
  const controller = new OrdersController(client);
  const order = await controller.createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          // payee: {
          //   merchantId: '',
          //   emailAddress: ''
          // },
          softDescriptor: 'Demo Shop',
          description: product.description,
          amount: {
            currencyCode: 'USD',
            value: '10.00',
          }
        }
      ]
    }
  }).catch(console.error);

  console.log('order', order);

  if(order && order.result) {
    return NextResponse.json({
      id: order.result.id,
      order: order
    });
  }

  // TODO: ERROR
}