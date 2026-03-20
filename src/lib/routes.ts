export const BASE_PATH = '/ui';

export const ROUTES = {
  HOME: `${BASE_PATH}`,
  DASHBOARD: `${BASE_PATH}/dashboard`,
  // TEAMS: `${BASE_PATH}/teams`,
  CART: `${BASE_PATH}/cart`,
  ABOUT: `${BASE_PATH}/about`,
  CHECKOUT: `${BASE_PATH}/cart/checkout`,
  LOGIN: `${BASE_PATH}/auth/login`,
  REGISTER: `${BASE_PATH}/auth/register`,
  LOGOUT: `${BASE_PATH}/auth/logout`,
  PLANS: `${BASE_PATH}/plans`,
  PISCOLAS: `${BASE_PATH}/piscolas`,
} as const;

export const ALL_ROUTES: string[] = Object.values(ROUTES);

export const ALLOWED_PARAMS = {
  freeAnonymous: ['utm_source', 'utm_medium', 'utm_campaign'],
  free: ['utm_source', 'utm_medium', 'utm_campaign'],
  basic: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'],
  pro: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id'],
};
