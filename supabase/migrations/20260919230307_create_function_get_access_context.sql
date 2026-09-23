CREATE OR REPLACE FUNCTION public.get_access_context()
  RETURNS jsonb
  LANGUAGE plpgsql
  STABLE SECURITY DEFINER
  SET search_path TO ''
AS $function$
DECLARE
v_service_id uuid;
    v_service_plan_key text;
    v_roles jsonb;
    v_permissions jsonb;
    v_entitlements jsonb;
    v_user_id uuid;
    v_anonymous boolean;
    v_subscription jsonb;
    v_teams jsonb;
    v_result jsonb;
BEGIN

v_user_id := (SELECT auth.uid() AS uid);

IF v_user_id IS NULL THEN
    v_anonymous := TRUE;

SELECT id, plan_key
INTO v_service_id, v_service_plan_key
FROM public.services
WHERE service_gateway = 'internal' AND name = 'FREE_ANONYMOUS' AND active = true
    LIMIT 1;

ELSE
    v_anonymous := FALSE;

SELECT s.id, s.plan_key
INTO v_service_id, v_service_plan_key
FROM public.subscriptions AS sb
         INNER JOIN public.services AS s ON sb.service_id = s.id
WHERE sb.user_id = v_user_id
  AND sb.status = 'ACTIVE';

END IF;

IF v_service_id IS NULL THEN
    -- EXCEPTION ???
END IF;


SELECT jsonb_build_object(
               'id', sb.id,
               'status', sb.status,
               'start_date', sb.start_date,
               'end_date', sb.end_date,
               'service_id', sb.service_id
       )
INTO v_subscription
FROM public.subscriptions AS sb
WHERE sb.user_id = v_user_id
  AND sb.status = 'ACTIVE';


SELECT jsonb_agg(
               jsonb_build_object(
                       'key', s.key,
                       'scope', s.scope
               )
       )
INTO v_roles
FROM (
         SELECT DISTINCT
             r.id,
             r.key,
             r.scope
         FROM public.user_roles AS ur
                  INNER JOIN public.roles AS r ON ur.role_id = r.id
         WHERE ur.user_id = v_user_id
           AND r.scope IN ('global', 'team')
     ) AS s;

SELECT jsonb_agg(
               jsonb_build_object(
                       'key', s.key,
                       'scope', s.scope
               )
       )
INTO v_permissions
FROM (
         SELECT DISTINCT
             p.id,
             p.key,
             p.scope
         FROM public.user_roles AS ur
                  INNER JOIN public.roles AS r ON ur.role_id = r.id
                  INNER JOIN public.role_permissions AS rp ON rp.role_id = r.id
                  INNER JOIN public.permissions AS p ON p.id = rp.permission_id
         WHERE ur.user_id = v_user_id
           AND r.scope IN ('global', 'team')
     ) AS s;


WITH role_permissions_json AS (
    SELECT
        rp.role_id,
        jsonb_agg(
                jsonb_build_object(
                        'key', p.key
                )
        ) AS permissions
    FROM public.role_permissions AS rp
             INNER JOIN public.permissions AS p
                        ON p.id = rp.permission_id
    GROUP BY rp.role_id
)
SELECT jsonb_agg(
               jsonb_build_object(
                       'team_id', t.id,
                       'role', r.key,
                       'permissions', COALESCE(
                               rpj.permissions,
                               '[]'::jsonb
                                      )
               )
       )
INTO v_teams
FROM public.team_members AS tm
         INNER JOIN public.teams AS t
                    ON tm.team_id = t.id
         INNER JOIN public.roles AS r
                    ON tm.role_id = r.id
         LEFT JOIN role_permissions_json AS rpj
                   ON rpj.role_id = r.id
WHERE tm.user_id = v_user_id
  AND tm.status = 'active';

SELECT jsonb_agg(
               jsonb_build_object(
                       'key', se.key,
                       'value', se.value
               )
       )
INTO v_entitlements
FROM public.service_entitlements AS se
WHERE se.service_id = v_service_id;

v_result := jsonb_build_object(
    'user_id', v_user_id,
    'anonymous', v_anonymous,
    'service_id', v_service_id,
    'subscription', v_subscription,
    'plan_key', v_service_plan_key,
    'roles', COALESCE(v_roles, '[]'::jsonb),
    'permissions', COALESCE(v_permissions, '[]'::jsonb),
    'entitlements', COALESCE(v_entitlements, '[]'::jsonb),
    'teams', COALESCE(v_teams, '[]'::jsonb)
);

RETURN v_result;

END;
$function$;
