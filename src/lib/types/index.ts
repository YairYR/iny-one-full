import type { userAgent } from "next/server";

export interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  id: string;
}

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

export interface ApiResponse<T = never> {
  code: number;
  message: string;
  data: T;
}

export interface UserClient {
  email?: string;
  name: string | null;
  picture: string | null;
  created_at: string;
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

export type Plan = Omit<IService, 'updated_at'|'created_at'|'active'>;

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