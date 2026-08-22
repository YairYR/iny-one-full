-- =============================================================================
-- iny.one — auditoría de esquema y seguridad
-- =============================================================================
-- Este archivo contiene UNA SOLA SENTENCIA a propósito: el SQL Editor de
-- Supabase sólo muestra el resultado de la última sentencia ejecutada, así que
-- cualquier script de varios bloques pierde todo menos el final.
--
-- Pegar el archivo entero en el editor, ejecutar, y copiar la celda de resultado.
--
-- Es de SOLO LECTURA y no devuelve datos personales: sólo metadatos del
-- catálogo y conteos. Validado contra PostgreSQL 16, incluido el caso de
-- tablas vacías.
--
-- Los planes de ejecución y el DDL propuesto están en `auditoria-ddl.sql`.
-- =============================================================================
--
-- Qué responde cada clave y qué sería una mala respuesta:
--
--  1  Índices de short_links. MALA: ninguno UNIQUE sobre (slug) — sin él, el
--     reintento por colisión de /api/v1/shorten no detecta nada y se insertan
--     slugs duplicados en silencio.
--  2  Slugs ya duplicados. MALA: cualquier fila. Hay que limpiarlos antes de
--     crear el índice único, o su creación fallará.
--  3  Restricciones y nulabilidad. MALA: slug con admite_null = YES.
--  4  RLS y tipo de cada objeto. MALA: rls_activo = false en una tabla con
--     datos de usuario; o una VISTA sin {security_invoker=true} en opciones,
--     porque entonces se ejecuta con permisos de su dueño y esquiva la RLS.
--  5  Contenido de las políticas. MALA: usando = "true" para el rol anon.
--  6  Funciones y quién las ejecuta. MALA: seguridad = DEFINER junto a
--     anon_puede = true en get_dashboard_stats_summary, get_page_traffic o
--     get_page_clicks_between_dates: permitiría leer la analítica de cualquier
--     usuario llamando al RPC directamente, saltándose la aplicación entera.
--  7  Permisos de anon/authenticated. MALA: INSERT, UPDATE o DELETE para anon
--     sobre short_links, users_profiles, subscriptions, orders o payments.
--  8  Volumen y uso de índices.
-- 10  Contador short_links.clicks, del que depende el ranking del dashboard.
--     MALA: con_valor muy por debajo de total_links, o desfase alto.
-- 11  Enlaces caducados que siguen marcados activos (housekeeping).
-- =============================================================================

select jsonb_pretty(jsonb_build_object(

  '1_indices_short_links', coalesce((
    select jsonb_agg(jsonb_build_object('nombre', indexname, 'definicion', indexdef) order by indexname)
    from pg_indexes where schemaname = 'public' and tablename = 'short_links'), '[]'::jsonb),

  '2_slugs_duplicados', coalesce((
    select jsonb_agg(jsonb_build_object('slug', slug, 'veces', n) order by n desc)
    from (select slug, count(*) as n from public.short_links
          group by slug having count(*) > 1 order by count(*) desc limit 20) d), '[]'::jsonb),

  '3_restricciones', coalesce((
    select jsonb_agg(jsonb_build_object('nombre', conname, 'definicion', pg_get_constraintdef(oid)) order by conname)
    from pg_constraint where conrelid = 'public.short_links'::regclass), '[]'::jsonb),

  '3b_columnas_clave', coalesce((
    select jsonb_agg(jsonb_build_object('columna', column_name, 'tipo', data_type, 'admite_null', is_nullable)
                     order by ordinal_position)
    from information_schema.columns
    where table_schema = 'public' and table_name = 'short_links'
      and column_name in ('slug', 'destination', 'status', 'user_id', 'ip_user', 'clicks', 'expires_at')), '[]'::jsonb),

  '4_rls_por_objeto', coalesce((
    select jsonb_agg(jsonb_build_object(
             'objeto', c.relname,
             'tipo', case c.relkind when 'r' then 'tabla' when 'p' then 'tabla particionada'
                                    when 'v' then 'vista' when 'm' then 'vista materializada' end,
             'rls_activo', c.relrowsecurity,
             'politicas', (select count(*) from pg_policy p where p.polrelid = c.oid),
             'opciones', c.reloptions) order by c.relkind, c.relname)
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r','p','v','m')), '[]'::jsonb),

  '5_politicas', coalesce((
    select jsonb_agg(jsonb_build_object('tabla', tablename, 'politica', policyname, 'roles', roles,
                                        'operacion', cmd, 'usando', qual, 'con_check', with_check)
                     order by tablename, policyname)
    from pg_policies where schemaname = 'public'), '[]'::jsonb),

  '6_funciones', coalesce((
    select jsonb_agg(jsonb_build_object(
             'funcion', n.nspname || '.' || p.proname,
             'argumentos', pg_get_function_identity_arguments(p.oid),
             'seguridad', case when p.prosecdef then 'DEFINER' else 'INVOKER' end,
             'anon_puede', has_function_privilege('anon', p.oid, 'EXECUTE'),
             'auth_puede', has_function_privilege('authenticated', p.oid, 'EXECUTE'))
             order by has_function_privilege('anon', p.oid, 'EXECUTE') desc, p.prosecdef desc, p.proname)
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public','security')), '[]'::jsonb),

  '7_permisos_anon_auth', coalesce((
    select jsonb_agg(jsonb_build_object('tabla', table_name, 'rol', grantee, 'privilegios', privs)
                     order by table_name, grantee)
    from (select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privs
          from information_schema.role_table_grants
          where table_schema = 'public' and grantee in ('anon','authenticated')
          group by table_name, grantee) g), '[]'::jsonb),

  '8_tablas', coalesce((
    select jsonb_agg(jsonb_build_object('tabla', s.relname, 'filas_aprox', s.n_live_tup,
                                        'tamano', pg_size_pretty(pg_total_relation_size(c.oid)),
                                        'seq_scan', s.seq_scan, 'idx_scan', s.idx_scan)
                     order by s.n_live_tup desc)
    from pg_stat_user_tables s join pg_class c on c.oid = s.relid
    where s.schemaname = 'public'), '[]'::jsonb),

  '10_clicks', (
    select jsonb_build_object('total_links', count(*), 'con_valor', count(clicks),
                              'suma_clicks', coalesce(sum(clicks), 0), 'maximo', max(clicks))
    from public.short_links),

  '10b_desfase_clicks', (
    select count(*) from public.short_links l
    join public.short_links_stats s on s.slug = l.slug
    where coalesce(l.clicks, 0) <> coalesce(s.total_clicks, 0)),

  '11_caducados_activos', (
    select count(*) from public.short_links
    where status = true and expires_at is not null and expires_at < now())

)) as auditoria;
