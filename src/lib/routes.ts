export const ROUTES = {
  HOME: '/ui',
  DASHBOARD: '/ui/dashboard',
  // TEAMS: '/ui/teams',
  CART: '/ui/cart',
  ABOUT: '/ui/about',
  CHECKOUT: '/ui/cart/checkout',
  LOGIN: '/ui/auth/login',
  REGISTER: '/ui/auth/register',
  LOGOUT: '/ui/auth/logout',
  PLANS: '/ui/plans',
  PISCOLAS: '/ui/piscolas',
} as const;

export const ALL_ROUTES: string[] = Object.values(ROUTES);
