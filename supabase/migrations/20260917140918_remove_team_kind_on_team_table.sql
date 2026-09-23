ALTER TABLE public.teams
    DROP CONSTRAINT teams_team_kind_check;

ALTER TABLE public.teams
    DROP COLUMN team_kind;
