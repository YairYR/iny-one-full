export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CART: '/cart',
  ABOUT: '/about',
  CHECKOUT: '/cart/checkout',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  PLANS: '/plans',
  PISCOLAS: '/piscolas',
} as const;

export const ALL_ROUTES: string[] = Object.values(ROUTES);

export const ALLOWED_PARAMS = {
  freeAnonymous: ['utm_source', 'utm_medium', 'utm_campaign'],
  free: ['utm_source', 'utm_medium', 'utm_campaign'],
  basic: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'],
  pro: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id'],
};
