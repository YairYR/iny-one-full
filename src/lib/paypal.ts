import {
  CheckoutPaymentIntent,
  Client,
  Environment,
  ItemCategory,
  LogLevel,
  OrdersController,
} from '@paypal/paypal-server-sdk';
import { ApiResponse } from "@apimatic/core/src/coreInterfaces";
import { AmountWithBreakdown } from "@paypal/paypal-server-sdk/src/models/amountWithBreakdown";
import { Money } from "@paypal/paypal-server-sdk/src/models/money";

const environment = (process.env.PAYPAL_API_ENVIRONMENT === Environment.Production)
  ? Environment.Production
  : Environment.Sandbox;

let client: Client | null = null;
export function getPayPalClient(): Client {
  if(! client) {
    client = new Client({
      environment: environment,
      clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_PUBLIC_API_CLIENT_ID!,
        oAuthClientSecret: process.env.PAYPAL_API_CLIENT_SECRET!,
      },
      logging: {
        logLevel: LogLevel.Info,
        logRequest: {
          logBody: true,
        },
        logResponse: {
          logHeaders: true,
        }
      }
    });
  }

  return client;
}

export function getPaypalProducts() {
  const client = getPayPalClient();
  const builder = client.getRequestBuilderFactory()('GET', '/v1/catalogs/products');

  builder.authenticate([{ oauth2: true }]);
  builder.json({
    page_size: 10,
    page: 1,
    total_required: true,
  });

  return builder.call();
}

export interface PaypalProduct {
  id: string,
  name: string,
  description: string,
  type: string,
  category: string,
  image_url: string,
  home_url: string,
  create_time: string,
  update_time: string,
  links: Array<
    {
      "href": string,
      "rel": string,
      "method": string
    }
  >
}

export async function getPaypalProduct(id: string): Promise<ApiResponse<void|PaypalProduct>> {
  const client = getPayPalClient();
  const builder = client.getRequestBuilderFactory()('GET', `/v1/catalogs/products/${id}`);
  builder.authenticate([{ oauth2: true }]);

  return builder.call().then((response) => {
    if(response.body && typeof response.body === 'string') {
      response.result = JSON.parse(response.body);
    }
    return response;
  });
}

export interface OrderProduct {
  product: PaypalProduct;
  unitAmount: Money;
}

export function createPaypalOrder(description: string, products: OrderProduct[], amount: AmountWithBreakdown) {
  const client = getPayPalClient();
  const controller = new OrdersController(client);

  return controller.createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount,
          description: description,
          items: products.map(({ product, unitAmount }) => ({
            name: product.name,
            description: product.description,
            category: ItemCategory.DigitalGoods,
            quantity: '1',
            unitAmount: unitAmount
          })),
        }
      ],
    }
  });
}
