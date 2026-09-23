CREATE OR REPLACE FUNCTION public.get_access_context()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
v_user_id uuid;
    v_anonymous boolean;

    v_service_id uuid;
    v_service_plan_key text;

    v_subscription jsonb;

    v_roles jsonb;
    v_permissions jsonb;
    v_entitlements jsonb;
    v_teams jsonb;

    v_result jsonb;
BEGIN

    /*
     * ------------------------------------------------------------
     * Authentication
     * ------------------------------------------------------------
     */

    v_user_id := auth.uid();

    v_anonymous := v_user_id IS NULL;


    /*
     * ------------------------------------------------------------
     * Effective service + subscription
     * ------------------------------------------------------------
     */

    IF v_anonymous THEN

        SELECT
            s.id,
            s.plan_key
        INTO
            v_service_id,
            v_service_plan_key
        FROM public.services AS s
        WHERE s.service_gateway = 'internal'
          AND s.name = 'FREE_ANONYMOUS'
          AND s.active = true
            LIMIT 1;

        ELSE

        SELECT
            s.id,
            s.plan_key,
            jsonb_build_object(
                    'id', sb.id,
                    'status', sb.status,
                    'start_date', sb.start_date,
                    'end_date', sb.end_date,
                    'service_id', sb.service_id
            )
        INTO
            v_service_id,
            v_service_plan_key,
            v_subscription
        FROM public.subscriptions AS sb
                 INNER JOIN public.services AS s
                            ON s.id = sb.service_id
        WHERE sb.user_id = v_user_id
          AND sb.status = 'ACTIVE'
          AND s.active = true
        ORDER BY sb.start_date DESC NULLS LAST
            LIMIT 1;

        /*
         * No active subscription => FREE.
         */

        IF v_service_id IS NULL THEN

            SELECT
                s.id,
                s.plan_key
            INTO
                v_service_id,
                v_service_plan_key
            FROM public.services AS s
            WHERE s.service_gateway = 'internal'
              AND s.name = 'FREE'
              AND s.active = true
                LIMIT 1;

            v_subscription := NULL;

        END IF;
    END IF;


    /*
     * ------------------------------------------------------------
     * Validate effective service
     * ------------------------------------------------------------
     */

    IF v_service_id IS NULL THEN
        RAISE EXCEPTION 'EFFECTIVE_SERVICE_NOT_FOUND'
            USING ERRCODE = 'P0001';
    END IF;


    /*
     * ------------------------------------------------------------
     * Global roles
     *
     * user_roles contains global roles.
     * Team roles are resolved through team_members below.
     * ------------------------------------------------------------
     */

    IF NOT v_anonymous THEN

        SELECT jsonb_agg(
                       jsonb_build_object(
                               'key', r.key,
                               'scope', r.scope
                       )
                           ORDER BY r.key
               )
        INTO v_roles
        FROM (
                 SELECT DISTINCT
                     r.id,
                     r.key,
                     r.scope
                 FROM public.user_roles AS ur
                          INNER JOIN public.roles AS r
                                     ON r.id = ur.role_id
                 WHERE ur.user_id = v_user_id
                   AND r.scope = 'global'
             ) AS r;

    END IF;


    /*
     * ------------------------------------------------------------
     * Global permissions
     *
     * Only permissions inherited from global roles.
     * ------------------------------------------------------------
     */

    IF NOT v_anonymous THEN

        SELECT jsonb_agg(
                       jsonb_build_object(
                               'key', p.key,
                               'scope', p.scope
                       )
                           ORDER BY p.key
               )
        INTO v_permissions
        FROM (
                 SELECT DISTINCT
                     p.id,
                     p.key,
                     p.scope
                 FROM public.user_roles AS ur
                          INNER JOIN public.roles AS r
                                     ON r.id = ur.role_id
                          INNER JOIN public.role_permissions AS rp
                                     ON rp.role_id = r.id
                          INNER JOIN public.permissions AS p
                                     ON p.id = rp.permission_id
                 WHERE ur.user_id = v_user_id
                   AND r.scope = 'global'
                   AND p.scope = 'global'
             ) AS p;

    END IF;


    /*
     * ------------------------------------------------------------
     * Team access
     *
     * team_members determines:
     *
     *   user -> team -> role
     *
     * role_permissions determines:
     *
     *   role -> permissions
     * ------------------------------------------------------------
     */

    IF NOT v_anonymous THEN

        WITH team_access AS (
            SELECT
                tm.team_id,
                r.key AS role,
                COALESCE(
                    jsonb_agg(
                        DISTINCT p.key
                        ORDER BY p.key
                    ) FILTER (
                        WHERE p.key IS NOT NULL
                    ),
                    '[]'::jsonb
                ) AS permissions
            FROM public.team_members AS tm
            INNER JOIN public.roles AS r
                ON r.id = tm.role_id
            LEFT JOIN public.role_permissions AS rp
                ON rp.role_id = r.id
            LEFT JOIN public.permissions AS p
                ON p.id = rp.permission_id
               AND p.scope = 'team'
            WHERE tm.user_id = v_user_id
              AND tm.status = 'active'
              AND r.scope = 'team'
            GROUP BY
                tm.team_id,
                r.key
        )
        SELECT jsonb_agg(
                       jsonb_build_object(
                               'team_id', team_id,
                               'role', role,
                               'permissions', permissions
                       )
                           ORDER BY team_id
               )
        INTO v_teams
        FROM team_access;

    END IF;


    /*
     * ------------------------------------------------------------
     * Service entitlements
     * ------------------------------------------------------------
     */

    SELECT jsonb_agg(
                   jsonb_build_object(
                           'key', se.key,
                           'value', se.value
                   )
                       ORDER BY se.key
           )
    INTO v_entitlements
    FROM public.service_entitlements AS se
    WHERE se.service_id = v_service_id;


/*
 * ------------------------------------------------------------
 * Result
 * ------------------------------------------------------------
 */

    v_result := jsonb_build_object(
        'user_id', v_user_id,
        'anonymous', v_anonymous,

        'service_id', v_service_id,

        'subscription', v_subscription,

        'plan_key', v_service_plan_key,

        'roles', COALESCE(
            v_roles,
            '[]'::jsonb
        ),

        'permissions', COALESCE(
            v_permissions,
            '[]'::jsonb
        ),

        'entitlements', COALESCE(
            v_entitlements,
            '[]'::jsonb
        ),
F
        'teams', COALESCE(
            v_teams,
            '[]'::jsonb
        )
    );

RETURN v_result;

END;
$function$;