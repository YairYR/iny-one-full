CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  team_kind text NOT NULL DEFAULT 'personal',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_slug_key UNIQUE (slug),
  CONSTRAINT teams_created_by_fkey
      FOREIGN KEY (created_by)
          REFERENCES auth.users(id)
          ON DELETE RESTRICT,
  CONSTRAINT teams_team_kind_check
      CHECK (team_kind IN ('personal', 'workspace'))
);

CREATE INDEX teams_created_by_idx
    ON public.teams(created_by);

CREATE UNIQUE INDEX teams_one_personal_per_user_idx
    ON public.teams (created_by)
    WHERE team_kind = 'personal';


CREATE TABLE public.team_members (
     team_id uuid NOT NULL,
     user_id uuid NOT NULL,

     role_id uuid NOT NULL,

     status text NOT NULL DEFAULT 'active',

     joined_at timestamptz NOT NULL DEFAULT now(),

     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now(),

     CONSTRAINT team_members_pkey
         PRIMARY KEY (team_id, user_id),

     CONSTRAINT team_members_team_fkey
         FOREIGN KEY (team_id)
             REFERENCES public.teams(id)
             ON DELETE CASCADE,

     CONSTRAINT team_members_user_fkey
         FOREIGN KEY (user_id)
             REFERENCES auth.users(id)
             ON DELETE CASCADE,

     CONSTRAINT team_members_role_fkey
         FOREIGN KEY (role_id)
             REFERENCES public.roles(id)
             ON DELETE RESTRICT,

     CONSTRAINT team_members_status_check
         CHECK (status IN ('active', 'invited', 'suspended'))
);

CREATE INDEX team_members_user_idx
    ON public.team_members(user_id);

CREATE INDEX team_members_role_idx
    ON public.team_members(role_id);


CREATE TYPE public.role_scope AS ENUM (
    'global',
    'team'
);

ALTER TABLE public.roles
    ADD COLUMN scope public.role_scope NOT NULL DEFAULT 'global';
ALTER TABLE public.permissions
    ADD COLUMN scope public.role_scope NOT NULL DEFAULT 'global';

ALTER TABLE public.short_links
    ADD COLUMN team_id uuid NULL;

ALTER TABLE public.short_links
    ADD CONSTRAINT short_links_team_fkey
        FOREIGN KEY (team_id)
            REFERENCES public.teams(id)
            ON DELETE SET NULL;

CREATE INDEX short_links_team_id_idx
    ON public.short_links(team_id);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

