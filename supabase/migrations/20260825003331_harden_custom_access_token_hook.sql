-- Regresión detectada el 2026-08-23 al comprobar el estado tras el merge a main.
--
-- El 20 de agosto `custom_access_token_hook` tenía `search_path=""` y sólo la
-- podía ejecutar `service_role`. Hoy el `search_path` está sin fijar y el
-- EXECUTE alcanza a `anon` y `authenticated`. Alguna de las migraciones del
-- equipo entre el 20 y el 22 la recreó sin esas dos guardas.
--
-- Importa porque es el hook que Supabase Auth invoca al emitir cada token: es
-- quien mete `user_role` y `user_plan` en el JWT, o sea la fuente de la que el
-- código deduce el plan y los permisos. Un `search_path` mutable en una función
-- de ese camino es el vector clásico de secuestro por resolución de nombres, y
-- publicarla por RPC no aporta nada: sólo la debe llamar `supabase_auth_admin`.
--
-- Se fija el search_path y se cierra el EXECUTE. La definición de la función no
-- se toca.

alter function public.custom_access_token_hook(jsonb) set search_path = '';

revoke all on function public.custom_access_token_hook(jsonb) from public, anon, authenticated;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;;
