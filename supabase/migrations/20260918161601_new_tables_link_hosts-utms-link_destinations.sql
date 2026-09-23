BEGIN;

-- ============================================================
-- 1. link_hosts
-- ============================================================

CREATE TABLE public.link_hosts (
   host_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   team_id uuid NOT NULL,
   subdomain text NOT NULL,
   status text NOT NULL DEFAULT 'active',

   created_at timestamptz NOT NULL DEFAULT now(),
   updated_at timestamptz NOT NULL DEFAULT now(),

   CONSTRAINT link_hosts_status_check
       CHECK (status IN ('active', 'disabled')),

   CONSTRAINT link_hosts_host_team_unique
       UNIQUE (host_id, team_id),

   CONSTRAINT link_hosts_team_fkey
       FOREIGN KEY (team_id)
           REFERENCES public.teams(id)
);


CREATE UNIQUE INDEX link_hosts_subdomain_unique
    ON public.link_hosts(subdomain);


-- ============================================================
-- 2. link_destinations
-- ============================================================

ALTER TABLE public.short_links
ADD CONSTRAINT short_links_link_id_unique UNIQUE (link_id);

CREATE TABLE public.link_destinations (
  link_id uuid PRIMARY KEY,

  domain text,
  subdomain text,

  validation_status text NOT NULL DEFAULT 'pending',
  validated_at timestamptz,

  CONSTRAINT link_destinations_validation_status_check
      CHECK (
          validation_status IN (
                'pending',
                'valid',
                'invalid',
                'blocked'
              )
          ),

  CONSTRAINT link_destinations_link_fkey
      FOREIGN KEY (link_id)
          REFERENCES public.short_links(link_id)
          ON DELETE CASCADE
);


INSERT INTO public.link_destinations (
    link_id,
    domain,
    subdomain,
    validation_status
)
SELECT
    link_id,
    domain,
    NULL,
    'pending'
FROM public.short_links;


-- ============================================================
-- 3. UTMs
-- ============================================================

CREATE TABLE public.utms (
     link_id uuid PRIMARY KEY,

     utm_source text,
     utm_medium text,
     utm_campaign text,
     utm_content text,
     utm_term text,
     utm_id text,

     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now(),

     CONSTRAINT utms_link_fkey
         FOREIGN KEY (link_id)
             REFERENCES public.short_links(link_id)
             ON DELETE CASCADE
);


INSERT INTO public.utms (
    link_id,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    utm_id,
    created_at,
    updated_at
)
SELECT
    link_id,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    utm_id,
    created_at,
    created_at
FROM public.short_links;


COMMIT;