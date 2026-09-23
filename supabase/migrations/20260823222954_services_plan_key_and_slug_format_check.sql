-- (a) `services.plan_key`
--
-- `services.name` guarda nombres de escaparate («Plan Starter», «Plan Pro») y el
-- código limita cuotas y parámetros UTM por una clave distinta: 'free' | 'basic'
-- | 'pro' (RATE_LIMITS y ALLOWED_PARAMS). No existía forma de ir de un servicio
-- a su clave, y por eso `sync-subscription` escribía `name: "basic"` fijo: quien
-- pagara el plan caro recibía los límites del barato.
--
-- Esta columna es ese puente. El nombre comercial puede cambiar sin tocar
-- código; la clave es la que manda para las cuotas.

alter table public.services
  add column if not exists plan_key text;

alter table public.services
  drop constraint if exists services_plan_key_check;

alter table public.services
  add constraint services_plan_key_check
  check (plan_key is null or plan_key in ('free', 'basic', 'pro'));

-- Mapeo por precio de los dos servicios activos: Starter (5) es el escalón
-- intermedio del código ('basic') y Pro (10) el superior ('pro'). Los inactivos
-- se dejan sin clave a propósito: reactivar uno obliga a decidir su cuota.
update public.services set plan_key = 'basic' where name = 'Plan Starter';
update public.services set plan_key = 'pro'   where name = 'Plan Pro';

comment on column public.services.plan_key is
  'Clave de cuota del código (free|basic|pro). Distinta de `name`, que es el nombre comercial. Un servicio de suscripción activo sin plan_key hace que el usuario caiga al plan gratuito.';

-- (b) Formato del slug en la base
--
-- Hasta ahora la única validación vivía en la aplicación, y el service role
-- escribe sin pasar por ella. Comprobado antes de aplicar: los 2.652 slugs
-- existentes cumplen el patrón, así que la restricción no rompe nada.
-- El rango llega a 32 porque es el máximo del slug elegido por el usuario.

alter table public.short_links
  drop constraint if exists short_links_slug_format_check;

alter table public.short_links
  add constraint short_links_slug_format_check
  check (slug ~ '^[A-Za-z0-9_-]{3,32}$');;
