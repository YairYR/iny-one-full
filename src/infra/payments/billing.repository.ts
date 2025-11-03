import { getPayPalClient } from "@/lib/paypal";
import { ApiResponse } from "@apimatic/core/src/coreInterfaces";
import { CreateSubscriptionRequestBody, SubscriptionResponseBody } from "@paypal/paypal-js";

/**
 * PayPal Plan and Subscription
 */
export const BillingRepository = {
  async getPlanById(id: string) {
    const paypal = getPayPalClient();
    const builder = paypal.getRequestBuilderFactory()('GET', `/v1/billing/plans/${id}`);
    builder.authenticate([ { oauth2: true } ]);

    const response = await builder.call();
    if (response.body && typeof response.body === 'string') {
      response.result = JSON.parse(response.body);
    }
    return response;
  },

  async getAllPlans() {
    const paypal = getPayPalClient();
    const builder = paypal.getRequestBuilderFactory()('GET', '/v1/billing/plans');
    builder.authenticate([ { oauth2: true } ]);

    const response = await builder.call();
    if (response.body && typeof response.body === 'string') {
      response.result = JSON.parse(response.body);
    }
    return response;
  },

  async createSubscription(subscription: Omit<CreateSubscriptionRequestBody, 'shipping_amount'>, requestId?: string) {
    const paypal = getPayPalClient();
    const builder = paypal.getRequestBuilderFactory()('POST', '/v1/billing/subscriptions');
    builder.authenticate([ { oauth2: true } ]);
    if(requestId) {
      builder.header('PayPal-Request-Id', requestId);
    }
    builder.json(subscription);

    const response: ApiResponse<SubscriptionResponseBody> = await builder.call() as never;
    if (response.body && typeof response.body === 'string') {
      response.result = JSON.parse(response.body);
    }
    return response;
  },

  /**
   *
   * @param id PayPal subscription id
   * @param fields
   */
  async getSubscription(id: string, fields?: string[]) {
    const paypal = getPayPalClient();
    const builder = paypal.getRequestBuilderFactory()('GET', `/v1/billing/subscriptions/${id}`);
    builder.authenticate([ { oauth2: true } ]);
    if(fields && fields.length > 0) {
      builder.query({ fields });
    }

    const response: ApiResponse<SubscriptionResponseBody> = await builder.call() as never;
    if (response.body && typeof response.body === 'string') {
      response.result = JSON.parse(response.body);
    }
    return response;
  },

  /**
   *
   * @param id PayPal subscription id
   * @param status
   * @param reason The reason for new status of the Subscription. [ 1 ... 128 ] characters
   */
  async setSubscriptionStatus(id: string, status: 'suspend'|'cancel'|'activate', reason: string) {
    const paypal = getPayPalClient();
    const builder = paypal.getRequestBuilderFactory()('POST', `/v1/billing/subscriptions/${id}/${status}`);
    builder.authenticate([ { oauth2: true } ]);
    builder.json({ reason });

    const response = await builder.call();
    if (response.body && typeof response.body === 'string') {
      response.result = JSON.parse(response.body);
    }
    return response;
  },
}
