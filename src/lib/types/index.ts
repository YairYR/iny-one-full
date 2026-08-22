import type { userAgent } from "next/server";

export type { ApiResponse } from '@/lib/types/api';

export interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  id: string;
}

/**
 * UTM ya resueltos para un link: todas las claves están presentes y valen `null`
 * cuando no se informaron. Modela lo que realmente se persiste, a diferencia de
 * `UtmParams`, que describe la forma de los valores cuando existen.
 */
export type UtmValues = { [Key in keyof UtmParams]: string | null };

export interface ClientInfo {
  ip: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  latitude: string | null;
  longitude: string | null;
  userAgent?: ReturnType<typeof userAgent>;
  referer?: string | null;
}

export interface UrlHistory<Utm = UtmParams> {
  [key: string]: ShortenedUrl<Utm>;
}

export interface ShortenedUrl<Utm = UtmParams> {
  url: string;
  short: string;
  utm: Utm;
}

export interface UserClient {
  id: string;
  email?: string | null;
  name: string | null;
  picture: string | null;
  created_at: string;
  role: string | null;
  plan: UserPlanSummary | null;
}

export interface UserPlanSummary {
  id: string | null;
  name: PlanName;
  isFree: boolean;
}

export interface IService {
  id: string;
  name: string;
  description: string|null;
  type: 'one_time'|'subscription';
  price: number;
  currency: string;
  active: boolean;
  interval: 'day'|'week'|'month'|'quarterly'|'biannual'|'year';
  service_gateway: string|null;
  external_service_id: string|null;
  created_at: string;
  updated_at: string;
}

export const PlanFree = 'free';
export const PlanBasic = 'basic';
export const PlanPro = 'pro';

export type Plan = Omit<IService, 'updated_at'|'created_at'|'active'>;
export type PlanName = typeof PlanFree |
    typeof PlanBasic |
    typeof PlanPro;

export interface Subscription {
  id: string;
  user_id: string;
  service_id: string;
  external_subscription_id: string|null;
  status: string;
  start_date: Date;
  end_date: Date;
  next_billing_date: Date;
  cancel_reason: string;
  created_at: Date;
  updated_at: Date;
}

/** INACTIVO: exportado pero sin referencias en el repositorio (rev. 2026-08-09). */
export interface OrderPay {
  id: string;
  user_id: string;
  service_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_gateway: string;
  external_order_id: string;
  description: string;
  created_at: string;
  updated_at: string;
  discount_id: string|null;
  discount_amount: number|null;
  subscription_id: string|null;
}

export type WebhookEventPaypal = {
  id: string;
  create_time: string;
  resource_type: string;
  event_type: string;
  summary: string;
  event_version: string;
  resource: Record<string, never>;
  links: Array<{
    href: string;
    rel: string;
    method?: string;
  }>;
}

export type UrlExpires = {
  expires_in_days: number;
  expires_at: string;
};

export type DashboardStatsSummary = {
  summary: {
    date_start: string;
    date_end: string;
    clicks: number;
    clicks_last_24h: number;
    date_grouping: 'day' | 'week' | 'month';
    stats: { date: string, clicks: number }[];
  },
  all_time: {
    clicks: number;
    top_browsers: { name: string, value: number }[];
    top_countries: { name: string, value: number }[];
  }
}
