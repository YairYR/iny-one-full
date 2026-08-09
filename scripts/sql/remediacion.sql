-- =============================================================================
-- iny.one — remediación de la auditoría del 2026-08-09
-- =============================================================================
-- Ejecutar los pasos EN ORDEN y UNO A UNO (el editor sólo muestra el resultado
-- de la última sentencia). Después de cada paso, probar la aplicación.
--
-- Resumen del hallazgo: RLS está activo en todas las tablas, pero dos políticas
-- con `using (true)` para el rol `public` dejan `history_clicks` y `short_links`
-- legibles por cualquiera que tenga la clave anónima — que va en el navegador y
-- es pública por diseño. No es un riesgo teórico: son 35 194 registros de clics
-- con IP, ciudad, coordenadas, user agent y referer.
-- =============================================================================


-- =============================================================================
-- PASO 0 — Comprobar la fuga desde fuera (opcional pero recomendable)
-- =============================================================================
-- Desde una terminal, con la clave anónima del proyecto (la de
-- NEXT_PUBLIC_SUPABASE_ANON_KEY). Si devuelve filas, está confirmado:
--
--   curl "https://TU_REF.supabase.co/rest/v1/history_clicks?select=*&limit=3" \
--        -H "apikey: TU_ANON_KEY"
--
--   curl "https://TU_REF.supabase.co/rest/v1/short_links?select=slug,destination,user_id,ip_user&limit=3" \
--        -H "apikey: TU_ANON_KEY"
--
-- Repetir estos mismos comandos después del paso 1: deben devolver [].


-- =============================================================================
-- PASO 1 — CRÍTICO: cerrar la lectura pública
-- =============================================================================

-- 1a. history_clicks: ninguna parte de la aplicación la lee con la clave
--     anónima. Las estadísticas se calculan con el service role, que ignora RLS.
drop policy if exists "Enable read access for all users" on public.history_clicks;

-- 1b. short_links: la política pública expone destino, user_id e ip_user de
--     todos los enlaces. La resolución en app/[short] usa service role y no
--     depende de ella; el dashboard sí lee con la sesión del usuario, así que
--     se sustituye por políticas acotadas al dueño.
drop policy if exists "Allow read for all" on public.short_links;

create policy "short_links_select_own"
  on public.short_links
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Necesaria para editar el alias desde el dashboard (userRepo.changeAlias).
-- Sin ella el UPDATE se deniega y la edición falla en silencio: PostgREST
-- devuelve 0 filas afectadas sin error, que es exactamente lo que hoy ocurre.
create policy "short_links_update_own"
  on public.short_links
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Comprobar el resultado:
-- select tablename, policyname, roles, cmd, qual
-- from pg_policies where schemaname = 'public' order by tablename;


-- =============================================================================
-- PASO 2 — Retirar los privilegios que nadie usa
-- =============================================================================
-- Hoy `anon` y `authenticated` tienen DELETE, INSERT, REFERENCES, SELECT,
-- TRIGGER, TRUNCATE y UPDATE sobre TODAS las tablas de `public`. Es el grant
-- por defecto de la plantilla de Supabase. Mientras RLS esté bien configurado
-- es inerte para SELECT/INSERT/UPDATE/DELETE, pero deja el sistema a una sola
-- equivocación de distancia del desastre: basta desactivar RLS en una tabla
-- para exponerla entera. Además TRUNCATE **no está sujeto a RLS**.
--
-- La aplicación accede a los datos con el service role salvo en el dashboard,
-- así que el conjunto realmente necesario es mínimo.

-- REQUISITO PREVIO: desplegar antes el cambio que quita el embebido
-- `stats:short_links_stats(...)` de getStatsUserUrls (src/infra/db/user.repository.ts).
-- Hoy ese embebido funciona sólo porque `authenticated` conserva el GRANT: RLS
-- filtra las filas y devuelve null. Al revocar el grant deja de ser un filtro y
-- pasa a ser «permission denied for table short_links_stats», un error duro que
-- tumba /api/dashboard/stats. Con el embebido fuera, este revoke es seguro.

revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

grant select, update on public.short_links to authenticated;

-- Probar después de este paso: crear un enlace sin sesión, resolver un enlace,
-- iniciar sesión, abrir el dashboard, paginar y editar un alias.
-- Si algo deja de devolver datos, el grant que falte se añade aquí de forma
-- explícita en lugar de revertir el revoke completo.


-- =============================================================================
-- PASO 3 — Funciones invocables por anon
-- =============================================================================

-- get_page_traffic es SECURITY DEFINER y anon puede ejecutarla: permite pedir
-- el tráfico por referer de cualquier lista de slugs llamando al RPC
-- directamente, sin pasar por la aplicación. La llama el dashboard con service
-- role, así que no necesita estar abierta.
revoke execute on function public.get_page_traffic(text[]) from anon, authenticated;

-- insert_blocked_url escribe en la denylist de dominios. Abierta a anon permite
-- inyectar dominios y bloquear destinos legítimos. Sólo la usan los scripts de
-- mantenimiento, que se autentican con service role.
revoke execute on function security.insert_blocked_url(text[]) from anon, authenticated;

-- REVISAR ANTES DE EJECUTAR: `authorize` es el patrón RBAC de Supabase y suele
-- invocarse desde dentro de políticas. Si alguna política la usa, revocarle el
-- EXECUTE al rol que evalúa la política rompe esa consulta. Comprobar primero:
--   select policyname, qual from pg_policies where qual ilike '%authorize%';
-- revoke execute on function public.authorize(app_permission) from anon;


-- =============================================================================
-- PASO 4 — Auditar el esquema `security`, que quedó fuera del primer barrido
-- =============================================================================
-- La auditoría sólo miró `public`. Este esquema guarda la denylist de dominios.
select jsonb_pretty(jsonb_build_object(
  'objetos', coalesce((
    select jsonb_agg(jsonb_build_object(
             'objeto', c.relname,
             'tipo', case c.relkind when 'r' then 'tabla' when 'v' then 'vista' else c.relkind::text end,
             'rls_activo', c.relrowsecurity,
             'politicas', (select count(*) from pg_policy p where p.polrelid = c.oid)))
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'security' and c.relkind in ('r','v','m','p')), '[]'::jsonb),
  'permisos', coalesce((
    select jsonb_agg(jsonb_build_object('tabla', table_name, 'rol', grantee, 'privilegios', privs))
    from (select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privs
          from information_schema.role_table_grants
          where table_schema = 'security' and grantee in ('anon','authenticated')
          group by table_name, grantee) g), '[]'::jsonb)
)) as esquema_security;


-- =============================================================================
-- PASO 5 — Housekeeping (sin urgencia)
-- =============================================================================
-- Enlaces anónimos caducados que siguen activos porque nadie los visitó:
-- 1 904 de 2 636 filas. Idempotente.
-- update public.short_links
--   set status = false
--   where status = true and expires_at is not null and expires_at < now();

-- Desfase entre short_links.clicks y short_links_stats.total_clicks: 315 filas.
-- Conviene decidir cuál es la fuente de verdad antes de tocar nada; el ranking
-- del dashboard usa short_links.clicks.
-- select l.slug, l.clicks, s.total_clicks
-- from public.short_links l
-- join public.short_links_stats s on s.slug = l.slug
-- where coalesce(l.clicks,0) <> coalesce(s.total_clicks,0)
-- order by abs(coalesce(l.clicks,0) - coalesce(s.total_clicks,0)) desc
-- limit 20;
