-- Function is called by create_link function, so we need to revoke execute permissions from public, anon, authenticated, and service_role roles to prevent direct access.
REVOKE EXECUTE ON FUNCTION public.increment_usage_counter(text, uuid, text, date, bigint) FROM public, anon, authenticated, service_role;

ALTER TABLE public.link_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- New functions to check team membership, role, and permissions

CREATE OR REPLACE FUNCTION public.is_team_member(
    p_team_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.team_members AS tm
        WHERE tm.team_id = p_team_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'active'
    );
$function$;


CREATE OR REPLACE FUNCTION public.get_team_role(
    p_team_id uuid
)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
    SELECT r.key
    FROM public.team_members AS tm
    INNER JOIN public.roles AS r ON r.id = tm.role_id
    WHERE tm.team_id = p_team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND r.scope = 'team'
    LIMIT 1;
$function$;


CREATE OR REPLACE FUNCTION public.has_global_permission(
    p_permission text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles AS ur
        INNER JOIN public.roles AS r ON r.id = ur.role_id
        INNER JOIN public.role_permissions AS rp ON rp.role_id = r.id
        INNER JOIN public.permissions AS p ON p.id = rp.permission_id
        WHERE ur.user_id = auth.uid()
          AND r.scope = 'global'
          AND p.scope = 'global'
          AND p.key = p_permission
    );
$function$;


CREATE OR REPLACE FUNCTION public.has_team_permission(
    p_team_id uuid,
    p_permission text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.team_members AS tm
        INNER JOIN public.roles AS r ON r.id = tm.role_id
        INNER JOIN public.role_permissions AS rp ON rp.role_id = r.id
        INNER JOIN public.permissions AS p ON p.id = rp.permission_id
        WHERE tm.team_id = p_team_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'active'
          AND r.scope = 'team'
          AND p.scope = 'team'
          AND p.key = p_permission
    );
$function$;


CREATE OR REPLACE FUNCTION public.get_effective_service()
RETURNS TABLE (
    service_id uuid,
    plan_key text,
    anonymous boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RETURN QUERY
        SELECT s.id, s.plan_key, true
        FROM public.services AS s
        WHERE s.service_gateway = 'internal'
          AND s.name = 'FREE_ANONYMOUS'
          AND s.active = true
        LIMIT 1;
        RETURN;
    END IF;

    RETURN QUERY
    SELECT s.id, s.plan_key, false
    FROM public.subscriptions AS sb
    INNER JOIN public.services AS s ON s.id = sb.service_id
    WHERE sb.user_id = v_user_id
      AND sb.status = 'ACTIVE'
      AND s.active = true
    ORDER BY sb.start_date DESC NULLS LAST
    LIMIT 1;

    IF FOUND THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT s.id, s.plan_key, false
    FROM public.services AS s
    WHERE s.service_gateway = 'internal'
      AND s.name = 'FREE'
      AND s.active = true
    LIMIT 1;
END;
$function$;



CREATE OR REPLACE FUNCTION public.get_entitlement_limit(
    p_service_id uuid,
    p_metric text
)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
    SELECT
        CASE
            WHEN jsonb_typeof(se.value) = 'number'
                THEN (se.value #>> '{}')::bigint
            ELSE NULL
        END
    FROM public.service_entitlements AS se
    WHERE se.service_id = p_service_id
      AND se.key = p_metric
    LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.has_entitlement_enabled(
    p_service_id uuid,
    p_metric text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
    SELECT COALESCE(
        (
            SELECT
                jsonb_typeof(se.value) = 'boolean'
                AND (se.value #>> '{}')::boolean
            FROM public.service_entitlements AS se
            WHERE se.service_id = p_service_id
            AND se.key = p_metric
            LIMIT 1
        ),
        FALSE
    );
$function$;


CREATE OR REPLACE FUNCTION public.get_usage(
    p_scope_type text,
    p_scope_id uuid,
    p_metric text,
    p_period_start date
)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
    SELECT COALESCE(
        (
            SELECT uc.used
            FROM public.usage_counters AS uc
            WHERE uc.scope_type = p_scope_type
              AND uc.scope_id = p_scope_id
              AND uc.metric = p_metric
              AND uc.period_start = p_period_start
        ),
        0
    );
$function$;


CREATE OR REPLACE FUNCTION public.has_usage_capacity(
    p_service_id uuid,
    p_scope_type text,
    p_scope_id uuid,
    p_metric text,
    p_entitlement text,
    p_period_start date,
    p_increment bigint DEFAULT 1
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
    SELECT
        p_service_id IS NOT NULL
        AND p_scope_type IS NOT NULL
        AND p_scope_id IS NOT NULL
        AND p_metric IS NOT NULL
        AND p_entitlement IS NOT NULL
        AND p_period_start IS NOT NULL
        AND p_increment IS NOT NULL
        AND p_increment > 0
        AND COALESCE(
            (
                SELECT uc.used
                FROM public.usage_counters AS uc
                WHERE uc.scope_type = p_scope_type
                  AND uc.scope_id = p_scope_id
                  AND uc.metric = p_metric
                  AND uc.period_start = p_period_start
            ),
            0
        ) + p_increment <= COALESCE(
            (
                SELECT
                    CASE
                        WHEN jsonb_typeof(se.value) = 'number'
                            THEN (se.value #>> '{}')::bigint
                        ELSE NULL
                    END
                FROM public.service_entitlements AS se
                WHERE se.service_id = p_service_id
                  AND se.key = p_entitlement
                LIMIT 1
            ),
            0
        );
$function$;


-- Update the RLS policies for some tables to use the new functions

-- TODO: In the future, consider offering subscriptions on a per-team basis.
-- TODO: When creating a domain, the limit must be validated.
-- It is currently validated against the user's subscription.


-----------------------------------------------
--                TEAMS                      --
-----------------------------------------------

CREATE POLICY "teams_select_own"
ON public.teams
FOR SELECT
TO authenticated
USING (
  public.has_team_permission(id, 'team.read')
);

CREATE POLICY "teams_update_own"
ON public.teams
FOR UPDATE
TO authenticated
USING (
  id IS NOT NULL
  AND  public.has_team_permission(id, 'team.update')
)
WITH CHECK (
  id IS NOT NULL
  AND  public.has_team_permission(id, 'team.update')
);

CREATE POLICY "teams_insert"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_entitlement_enabled(
    (select service_id from public.get_effective_service() as service_id),
    'team.enabled'
  )
);

-----------------------------------------------
--         TEAM_MEMBERS                      --
-----------------------------------------------

CREATE POLICY "team_members_select_own"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  team_id IS NOT NULL
  AND public.has_team_permission(team_id, 'team.members.read')
);

CREATE POLICY "team_members_update_own"
ON public.team_members
FOR UPDATE
TO authenticated
USING (
  team_id IS NOT NULL
  AND  public.has_team_permission(team_id, 'team.members.update')
)
WITH CHECK (
  team_id IS NOT NULL
  AND  public.has_team_permission(team_id, 'team.members.update')
);

CREATE POLICY "team_members_insert"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (
  team_id IS NOT NULL
  AND public.has_team_permission(team_id, 'team.members.invite')
);

-----------------------------------------------
--         SHORT_LINKS                       --
-----------------------------------------------

ALTER POLICY "short_links_select_own"
ON "public"."short_links"
TO authenticated
USING (
  team_id IS NOT NULL
  AND public.has_team_permission(team_id, 'links.read')
);

ALTER POLICY "short_links_update_own"
ON "public"."short_links"
TO authenticated
USING (
  team_id IS NOT NULL
  AND  public.has_team_permission(team_id, 'links.update')
)
WITH CHECK (
  team_id IS NOT NULL
  AND  public.has_team_permission(team_id, 'links.update')
);

-----------------------------------------------
--          LINK_HOSTS                       --
-----------------------------------------------

CREATE POLICY "link_hosts_select_own"
ON "public"."link_hosts"
FOR SELECT
TO authenticated
USING (
  team_id IS NOT NULL
  AND public.has_team_permission(team_id, 'domains.read')
);


CREATE POLICY "link_hosts_update_own"
ON public.link_hosts
FOR UPDATE
TO authenticated
USING (
  team_id IS NOT NULL
  AND public.has_team_permission(team_id, 'domains.update')
)
WITH CHECK (
  team_id IS NOT NULL
  AND public.has_team_permission(team_id, 'domains.update')
);

CREATE POLICY "link_hosts_insert"
ON public.link_hosts
FOR INSERT
TO authenticated
WITH CHECK (
  team_id IS NOT NULL
  AND public.has_team_permission(team_id, 'domains.create')
  AND public.has_entitlement_enabled(
    (select service_id from public.get_effective_service() as service_id),
    'domains.enabled'
  )
);
