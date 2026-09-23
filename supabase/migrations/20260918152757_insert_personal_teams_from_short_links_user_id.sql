BEGIN;

-- ============================================================
-- 1. Validaciones
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.roles
        WHERE key = 'team_owner'
    ) THEN
        RAISE EXCEPTION
            'Migration aborted: role team_owner does not exist';
END IF;
END
$$;

-- ============================================================
-- 2. Crear un Personal Team por usuario
-- ============================================================

INSERT INTO public.teams (
    id,
    name,
    created_by
)
SELECT
    gen_random_uuid(),
    'Personal',
    user_id
FROM (
         SELECT DISTINCT user_id
         FROM public.short_links
         WHERE user_id IS NOT NULL
     ) users;


-- ============================================================
-- 3. Crear team_members
--
-- Si ya existe esta tabla en tu BD, NO la crees aquí.
-- Ejecuta solamente el INSERT.
-- ============================================================

-- INSERT INTO public.team_members (...)
-- ...


-- ============================================================
-- 4. Insertar owner de cada Personal Team
-- ============================================================

INSERT INTO public.team_members (
    team_id,
    user_id,
    role_id
)
SELECT
    t.id,
    t.created_by,
    r.id
FROM public.teams t
         CROSS JOIN public.roles r
WHERE t.name = 'Personal'
  AND r.key = 'team_owner';

INSERT INTO public.users_profiles (
    id,
    created_at,
    updated_at,
    plan,
    default_team_id
)
SELECT
    t.created_by,
    (NOW() AT TIME ZONE 'UTC'),
    (NOW() AT TIME ZONE 'UTC'),
    'free',
    t.id
FROM public.teams t
WHERE t.name = 'Personal';

COMMIT;