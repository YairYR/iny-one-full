BEGIN;


-- ============================================================
-- 1. Cambiar PK short_links
-- ============================================================

ALTER TABLE public.short_links
DROP CONSTRAINT IF EXISTS short_links_pkey;

ALTER TABLE public.short_links
    ADD CONSTRAINT short_links_pkey
        PRIMARY KEY (link_id);


-- ============================================================
-- 2. Eliminar slug de tablas estadísticas
-- ============================================================

ALTER TABLE public.short_links_stats
DROP COLUMN slug;

ALTER TABLE public.short_links_daily_stats
DROP CONSTRAINT IF EXISTS short_links_daily_stats_pkey;

ALTER TABLE public.short_links_daily_stats
DROP COLUMN slug;

ALTER TABLE public.short_links_daily_stats
    ADD CONSTRAINT short_links_daily_stats_pkey
        PRIMARY KEY (link_id, date);

ALTER TABLE public.short_links_monthly_stats
DROP CONSTRAINT IF EXISTS short_links_monthly_stats_pkey;

ALTER TABLE public.short_links_monthly_stats
DROP COLUMN slug;

ALTER TABLE public.short_links_monthly_stats
    ADD CONSTRAINT short_links_monthly_stats_pkey
        PRIMARY KEY (link_id, year, month);


-- ============================================================
-- 3. short_links_stats PK
-- ============================================================

ALTER TABLE public.short_links_stats
DROP CONSTRAINT IF EXISTS short_links_stats_pkey;

ALTER TABLE public.short_links_stats
    ADD CONSTRAINT short_links_stats_pkey
        PRIMARY KEY (link_id);


-- ============================================================
-- 4. destination changes
-- ============================================================

ALTER TABLE public.short_link_destination_changes
DROP COLUMN slug;


-- ============================================================
-- 5. history clicks
-- ============================================================

ALTER TABLE public.history_clicks
DROP COLUMN slug;


COMMIT;