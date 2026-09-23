BEGIN;

ALTER TABLE public.short_links
    ADD COLUMN host_id uuid NULL;

ALTER TABLE public.short_links
    ADD CONSTRAINT short_links_host_team_fkey
        FOREIGN KEY (host_id, team_id)
            REFERENCES public.link_hosts(host_id, team_id);

-- ============================================================
-- 1. status boolean -> text
-- ============================================================

ALTER TABLE public.short_links
    ADD COLUMN new_status text;

UPDATE public.short_links
SET new_status = CASE
                     WHEN status = true THEN 'active'
                     ELSE 'disabled'
    END;

ALTER TABLE public.short_links
DROP COLUMN status;

ALTER TABLE public.short_links
    RENAME COLUMN new_status TO status;

ALTER TABLE public.short_links
    ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.short_links
    ALTER COLUMN status SET DEFAULT 'active';

ALTER TABLE public.short_links
    ADD CONSTRAINT short_links_status_check
        CHECK (status IN ('active', 'disabled'));


-- ============================================================
-- 2. destination
-- ============================================================

ALTER TABLE public.short_links
    ALTER COLUMN destination SET NOT NULL;


-- ============================================================
-- 3. slug
-- ============================================================

ALTER TABLE public.short_links
    ALTER COLUMN slug SET NOT NULL;


-- ============================================================
-- 4. Índice host + slug
--
-- NULL = dominio base
-- ============================================================

CREATE UNIQUE INDEX short_links_host_slug_unique
    ON public.short_links (host_id, slug)
    NULLS NOT DISTINCT;


-- ============================================================
-- 5. Índices
-- ============================================================

DROP INDEX IF EXISTS public.short_links_user_id_created_at_idx;

DROP INDEX IF EXISTS public.short_links_ip_user_created_at_idx;


CREATE INDEX short_links_team_id_created_at_idx
    ON public.short_links (team_id, created_at DESC);


CREATE INDEX short_links_created_by_created_at_idx
    ON public.short_links (created_by, created_at DESC)
    WHERE created_by IS NOT NULL;


-- ============================================================
-- 6. Índices de history_clicks
-- ============================================================

DROP INDEX IF EXISTS public.history_clicks_slug_idx;

DROP INDEX IF EXISTS public.history_clicks_slug_created_at_idx;


CREATE INDEX history_clicks_link_id_idx
    ON public.history_clicks (link_id);


CREATE INDEX history_clicks_link_id_created_at_idx
    ON public.history_clicks (link_id, created_at DESC);


-- ============================================================
-- 7. Índice destination changes
-- ============================================================

DROP INDEX IF EXISTS
    public.short_link_destination_changes_slug_changed_at_idx;


CREATE INDEX short_link_destination_changes_link_changed_at_idx
    ON public.short_link_destination_changes
        (link_id, changed_at DESC);


-- ============================================================
-- 8. Eliminar columnas antiguas
-- ============================================================

ALTER TABLE public.short_links
DROP COLUMN user_id,
    DROP COLUMN ip_user,
    DROP COLUMN country_code_user,
    DROP COLUMN domain,
    DROP COLUMN utm_source,
    DROP COLUMN utm_medium,
    DROP COLUMN utm_campaign,
    DROP COLUMN utm_content,
    DROP COLUMN utm_term,
    DROP COLUMN utm_id,
    DROP COLUMN alias;


COMMIT;