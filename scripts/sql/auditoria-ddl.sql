-- =============================================================================
-- iny.one — planes de ejecución y DDL correctivo
-- =============================================================================
-- Complemento de `auditoria.sql`. Aquí SÍ hay varias sentencias: ejecutar
-- UNA POR UNA, porque el SQL Editor sólo muestra el resultado de la última.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Medición del rate limit (antes y después de crear los índices)
-- -----------------------------------------------------------------------------
-- Son SELECT COUNT: ANALYZE los ejecuta pero no modifican nada.
-- Buscar "Seq Scan on short_links" frente a "Index Scan"/"Bitmap Index Scan".
--
-- Medido el 2026-08-09, antes de cualquier índice: Seq Scan, 2 636 filas
-- recorridas, 0,45 ms. A este volumen el planificador elegiría Seq Scan aunque
-- hubiera índice, así que estas mediciones sólo empiezan a ser interesantes
-- cuando la tabla crece un orden de magnitud.

-- Consulta de cuota anónima (por IP).
explain analyze
select count(*)
from public.short_links
where user_id is null
  and ip_user = '203.0.113.10'
  and created_at >= now() - interval '1 month';

-- Consulta de cuota autenticada. Toma un user_id real con links, para que el
-- plan sea representativo en lugar de filtrar sobre un UUID inexistente.
explain analyze
select count(*)
from public.short_links
where user_id = (select user_id from public.short_links where user_id is not null limit 1)
  and created_at >= now() - interval '1 month';


-- =============================================================================
-- DDL PROPUESTO — descomentar y ejecutar de una en una
-- =============================================================================
-- CREATE INDEX CONCURRENTLY no puede correr dentro de un bloque de transacción:
-- enviar cada sentencia sola. CONCURRENTLY evita bloquear la tabla.


-- 1) CORRECTITUD, independiente del volumen. El reintento por colisión de
--    /api/shorten se apoya en el error 23505 que sólo emite esta restricción.
--    Requisito: que el bloque 2 de la auditoría no haya devuelto duplicados.
-- create unique index concurrently if not exists short_links_slug_uidx
--   on public.short_links (slug);

-- 2) Sólo si la auditoría confirma que slug admite null.
-- alter table public.short_links alter column slug set not null;

-- 3) RENDIMIENTO, no urgente al volumen actual (~2 600 filas) pero barato y
--    previsor: son las dos consultas del rate limit.
-- create index concurrently if not exists short_links_user_created_idx
--   on public.short_links (user_id, created_at desc);

-- create index concurrently if not exists short_links_ip_created_idx
--   on public.short_links (ip_user, created_at desc)
--   where user_id is null;

-- 4) HOUSEKEEPING. Los links anónimos caducan a los 180 días pero sólo se
--    desactivan cuando alguien los visita, así que quedan colgados los que
--    nunca se visitaron. Idempotente: se puede repetir cuando haga falta.
--    Al 2026-08-09 eran 1 892 de ~2 636 filas.
-- update public.short_links
--   set status = false
--   where status = true and expires_at is not null and expires_at < now();
