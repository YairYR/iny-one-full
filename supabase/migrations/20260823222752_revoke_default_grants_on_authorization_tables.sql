-- Las seis tablas creadas para el sistema de roles y suscripciones llegaron con
-- el grant por defecto de la plantilla de Supabase para `anon` y `authenticated`
-- (DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE). Es el mismo
-- grant que se retiró en agosto: crear tablas desde el panel vuelve a aplicarlo.
--
-- Las políticas RLS existentes son correctas y sólo de SELECT, así que hoy no se
-- puede escribir a través de PostgREST. Lo que sobra es el permiso: `TRUNCATE`
-- **no está sujeto a RLS**, y el resto es superficie que no hace falta.
--
-- `AuthorizationRepository` lee con la sesión del usuario, así que
-- `authenticated` conserva SELECT sobre lo que consulta; `anon` no necesita nada.

revoke all on public.roles                 from public, anon, authenticated;
revoke all on public.permissions           from public, anon, authenticated;
revoke all on public.role_permissions      from public, anon, authenticated;
revoke all on public.service_entitlements  from public, anon, authenticated;
revoke all on public.user_roles            from public, anon, authenticated;
revoke all on public.subscription_requests from public, anon, authenticated;
revoke all on public.subscriptions         from public, anon, authenticated;

grant select on public.roles                 to authenticated;
grant select on public.permissions           to authenticated;
grant select on public.role_permissions      to authenticated;
grant select on public.service_entitlements  to authenticated;
grant select on public.user_roles            to authenticated;
grant select on public.subscription_requests to authenticated;
grant select on public.subscriptions         to authenticated;

grant all on all tables in schema public to service_role;

-- Sobraba una de las dos políticas idénticas de SELECT sobre subscription_requests.
drop policy if exists "Users can view their own subscription requests" on public.subscription_requests;;
