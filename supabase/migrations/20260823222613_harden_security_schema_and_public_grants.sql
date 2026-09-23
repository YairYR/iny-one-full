-- Auditoría del 2026-08-20, pasos 1 y 2.
--
-- Las cuatro tablas de `security` tenían una política `USING (true)` para el rol
-- `public` y SELECT concedido a PUBLIC: a nivel de base cualquiera con la clave
-- anónima podía leer el blocklist entero. No son datos personales, pero sí un
-- oráculo sobre la defensa antiabuso (permite preguntar si un dominio está
-- bloqueado antes de usarlo).
--
-- Trampa que ya nos costó un ciclo con las funciones y que estaba también en las
-- tablas: `revoke ... from anon, authenticated` NO toca lo concedido a `PUBLIC`,
-- y ambos roles lo heredan por ahí. Hay que revocar a `public`, y eso también se
-- lo quita a `service_role`, así que se le devuelve explícitamente.

drop policy if exists "Enable read access for all users" on security.blocked_url;
drop policy if exists "Enable read access for all users" on security.blocklist_url_phishing_active;
drop policy if exists "Enable read access for all users" on security.cached_blocked_url;
drop policy if exists "Enable read access for all users" on security.whitelist_url;

revoke all on all tables in schema security from public, anon, authenticated;
grant usage on schema security to service_role;
grant all on all tables in schema security to service_role;

-- En `public` hoy lo tapa RLS, así que esto es defensa en profundidad: mientras
-- el permiso exista basta un `disable row level security` por error para exponer
-- la tabla entera, y `history_clicks` guarda IP, ciudad y coordenadas.
revoke all on public.short_links      from public, anon;
revoke all on public.history_clicks   from public, anon, authenticated;
revoke all on public.domains_to_check from public, anon, authenticated;

-- Único grant que la aplicación necesita con la sesión del usuario: escribe
-- alias y destino apoyada en short_links_select_own / short_links_update_own.
grant select, update on public.short_links to authenticated;
grant all on all tables in schema public to service_role;;
