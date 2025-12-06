export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  // TEAMS: '/teams',
  CART: '/cart',
  ABOUT: '/about',
  CHECKOUT: '/cart/checkout',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  PLANS: '/plans',
} as const;

export const ALL_ROUTES: string[] = Object.values(ROUTES);
