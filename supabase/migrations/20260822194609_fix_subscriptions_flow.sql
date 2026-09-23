-- 1. Eliminar la restricción actual
alter table public.subscriptions
drop constraint if exists subscriptions_user_id_key;
-- 2. El ID de PayPal debe ser único
create unique index if not exists subscriptions_gateway_external_id_uidx
    on public.subscriptions (
    subscription_gateway,
    external_subscription_id
    )
    where external_subscription_id is not null;
-- 3. Un usuario no puede tener dos suscripciones activas
create unique index if not exists subscriptions_one_active_per_user_uidx
    on public.subscriptions (user_id )
    where status in ('ACTIVE', 'APPROVED');
-- 4. Un usuario no puede tener dos suscripciones pendientes para el mismo servicio
create unique index subscriptions_one_pending_per_user_service_uidx
    on public.subscriptions (user_id, service_id)
    where status in (
  'INSERTED',
  'APPROVAL_PENDING',
  'APPROVED'
);
drop table if exists public.webhook_events cascade;
create table public.webhook_events (
                                       id uuid not null default gen_random_uuid (),
                                       gateway text null default 'paypal'::text,
                                       event_type text null,
                                       external_event_id text null,
                                       payload jsonb null,
                                       created_at timestamp with time zone null default now(),
                                       processed_at timestamptz null,
                                       summary text null,
                                       resource_type text null,
                                       constraint webhook_events_pkey primary key (id),
                                       constraint webhook_events_external_event_id_key unique (gateway, external_event_id)
) TABLESPACE pg_default;
create index if not exists webhook_events_type_idx
    on public.webhook_events (event_type);
create index if not exists webhook_events_created_at_idx
    on public.webhook_events (created_at);
create index if not exists subscriptions_user_status_idx
    on public.subscriptions (user_id, status);
create index if not exists subscriptions_next_billing_idx
    on public.subscriptions (next_billing_date)
    where next_billing_date is not null;
create index if not exists payments_external_payment_id_idx
    on public.payments (external_payment_id)
    where external_payment_id is not null;
create unique index if not exists payments_gateway_external_id_uidx
    on public.payments (gateway, external_payment_id)
    where external_payment_id is not null;
alter table public.orders
add expires_at timestamp with time zone null;
-- Evita problemas de concurrencia, un usuario no puede tener dos órdenes pendientes para el mismo servicio y pasarela de pago
create unique index orders_one_pending_per_user_service_gateway_uidx
    on public.orders (
                      user_id,
                      service_id,
                      payment_gateway
        )
    where status = 'pending';
