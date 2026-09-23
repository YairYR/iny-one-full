ALTER TABLE public.teams
    DROP CONSTRAINT teams_slug_key;

ALTER TABLE public.teams
    DROP COLUMN slug;
