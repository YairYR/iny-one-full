BEGIN;

-- ============================================================
-- 1. link_id
-- ============================================================

ALTER TABLE public.short_links
    ADD COLUMN link_id uuid;

UPDATE public.short_links
SET link_id = gen_random_uuid();

ALTER TABLE public.short_links
    ALTER COLUMN link_id SET NOT NULL;


-- ============================================================
-- 2. team_id
-- ============================================================

UPDATE public.short_links sl
SET team_id = t.id
    FROM public.teams t
WHERE t.created_by = sl.user_id
  AND t.name = 'Personal';

-- ============================================================
-- 3. created_by
-- ============================================================

ALTER TABLE public.short_links
    ADD COLUMN created_by uuid,
    ADD COLUMN created_by_ip inet,
    ADD COLUMN created_by_country_code text;


UPDATE public.short_links
SET
    created_by = user_id,
    created_by_ip = CASE
                        WHEN ip_user IS NULL OR trim(ip_user) = '' OR ip_user = '::1' THEN NULL
                        ELSE ip_user::inet
        END,
    created_by_country_code = country_code_user;


-- ============================================================
-- 4. name
-- ============================================================

ALTER TABLE public.short_links
    ADD COLUMN name text;

UPDATE public.short_links
SET name = alias;


-- ============================================================
-- 5. FK nuevas
-- ============================================================

ALTER TABLE public.short_links
    ADD CONSTRAINT short_links_created_by_fkey
        FOREIGN KEY (created_by)
            REFERENCES auth.users(id)
            ON DELETE SET NULL;


COMMIT;