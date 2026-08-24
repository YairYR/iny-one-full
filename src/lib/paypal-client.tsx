import {Components, PageTypes} from "@paypal/paypal-js/sdk-v6";

export const PAYPAL_CONFIG = Object.freeze({
    clientId: process.env.PAYPAL_PUBLIC_API_CLIENT_ID!,
    environment: (process.env.PAYPAL_API_ENVIRONMENT ?? 'sandbox').toLowerCase(),
    components: ["paypal-subscriptions"],
    pageType: "checkout"
} as PayPalConfig);

interface PayPalConfig {
    clientId: string;
    environment: 'sandbox' | 'production';
    components?: Components[];
    pageType?: PageTypes;
}
