BEGIN;


-- ============================================================
-- 1. short_links_stats
-- ============================================================

ALTER TABLE public.short_links_stats
    ADD COLUMN link_id uuid;

UPDATE public.short_links_stats s
SET link_id = sl.link_id
    FROM public.short_links sl
WHERE sl.slug = s.slug;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.short_links_stats
        WHERE link_id IS NULL
    ) THEN
        RAISE EXCEPTION
            'short_links_stats: unmapped rows exist';
END IF;
END
$$;


-- ============================================================
-- 2. daily stats
-- ============================================================

ALTER TABLE public.short_links_daily_stats
    ADD COLUMN link_id uuid;

UPDATE public.short_links_daily_stats s
SET link_id = sl.link_id
    FROM public.short_links sl
WHERE sl.slug = s.slug;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.short_links_daily_stats
        WHERE link_id IS NULL
    ) THEN
        RAISE EXCEPTION
            'short_links_daily_stats: unmapped rows exist';
END IF;
END
$$;


-- ============================================================
-- 3. monthly stats
-- ============================================================

ALTER TABLE public.short_links_monthly_stats
    ADD COLUMN link_id uuid;

UPDATE public.short_links_monthly_stats s
SET link_id = sl.link_id
    FROM public.short_links sl
WHERE sl.slug = s.slug;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.short_links_monthly_stats
        WHERE link_id IS NULL
    ) THEN
        RAISE EXCEPTION
            'short_links_monthly_stats: unmapped rows exist';
END IF;
END
$$;


-- ============================================================
-- 4. destination changes
-- ============================================================

ALTER TABLE public.short_link_destination_changes
    ADD COLUMN link_id uuid;

UPDATE public.short_link_destination_changes c
SET link_id = sl.link_id
    FROM public.short_links sl
WHERE sl.slug = c.slug;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.short_link_destination_changes
        WHERE link_id IS NULL
    ) THEN
        RAISE EXCEPTION
            'short_link_destination_changes: unmapped rows exist';
END IF;
END
$$;


-- ============================================================
-- 5. history_clicks
-- ============================================================

ALTER TABLE public.history_clicks
    ADD COLUMN link_id uuid;

UPDATE public.history_clicks hc
SET link_id = sl.link_id
    FROM public.short_links sl
WHERE sl.slug = hc.slug;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.history_clicks
        WHERE link_id IS NULL
    ) THEN
        RAISE EXCEPTION
            'history_clicks: unmapped rows exist';
END IF;
END
$$;


-- ============================================================
-- 6. Todos los link_id son NOT NULL
-- ============================================================

ALTER TABLE public.short_links_stats
    ALTER COLUMN link_id SET NOT NULL;

ALTER TABLE public.short_links_daily_stats
    ALTER COLUMN link_id SET NOT NULL;

ALTER TABLE public.short_links_monthly_stats
    ALTER COLUMN link_id SET NOT NULL;

ALTER TABLE public.short_link_destination_changes
    ALTER COLUMN link_id SET NOT NULL;

ALTER TABLE public.history_clicks
    ALTER COLUMN link_id SET NOT NULL;


COMMIT;