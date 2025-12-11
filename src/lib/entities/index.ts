import { Tables } from "@/lib/types/db.types";

export type ShortLink = Tables<'short_links'>;
export type UserProfile = Tables<'users_profiles'>;
export type Service = Tables<'services'>;
export type Payment = Tables<'payments'>;
export type Subscription = Tables<'subscriptions'>;
export type Discount = Tables<'discounts'>;
export type Order = Tables<'orders'>;
export type WebhookEvent = Tables<'webhook_events'>;
export type HistoryClick = Tables<'history_clicks'>;
export type AuditLog = Tables<'audit_logs'>;

type entities = {
  ShortLink: ShortLink
  UserProfile: UserProfile
  Service: Service
  Payment: Payment
  Subscription: Subscription
  Discount: Discount
  Order: Order
  WebhookEvent: WebhookEvent
  HistoryClick: HistoryClick
  AuditLog: AuditLog
};

export default entities;
