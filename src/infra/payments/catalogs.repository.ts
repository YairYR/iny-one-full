import { getPayPalClient } from "@/lib/paypal";
import { ApiResponse } from "@apimatic/core/src/coreInterfaces";

/**
 * PayPal Catalog and Products
 */
export const CatalogsRepository = {
  async getAllProducts() {
    const client = getPayPalClient();
    const builder = client.getRequestBuilderFactory()('GET', '/v1/catalogs/products');

    builder.authenticate([{ oauth2: true }]);
    builder.json({
      page_size: 10,
      page: 1,
      total_required: true,
    });

    return builder.call();
  },

  async getProduct(id: string): Promise<ApiResponse<void|PaypalProduct>> {
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