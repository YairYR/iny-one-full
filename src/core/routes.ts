const BASE_URL = '/ui' as const;

export const PAGES = {
  HOME: BASE_URL + '',
  DASHBOARD: BASE_URL + '/dashboard',
  ABOUT: BASE_URL + '/about',
  PISCOLAS: BASE_URL + '/piscolas',
  PLANS: BASE_URL + '/plans',
  CART: BASE_URL + '/cart',
  auth: {
    LOGIN: BASE_URL + '/auth/login',
    LOGOUT: BASE_URL + '/auth/logout',
    REGISTER: BASE_URL + '/auth/register',
  },
} as const;
