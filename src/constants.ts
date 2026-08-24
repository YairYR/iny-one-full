import 'server-only';

export const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';
export const IS_DEVELOPMENT = process.env.VERCEL_ENV === 'development';
export const CART_COOKIE_NAME = 'cart_items';
export const REDIRECT_TO_COOKIE_NAME = '_redirect_to';
