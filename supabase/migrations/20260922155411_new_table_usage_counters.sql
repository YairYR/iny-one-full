CREATE TABLE IF NOT EXISTS public.usage_counters (
   scope_type text NOT NULL,
   scope_id uuid NOT NULL,
   metric text NOT NULL,
   period_start date NOT NULL,
   used bigint NOT NULL DEFAULT 0,

   CONSTRAINT usage_counters_pkey
       PRIMARY KEY (
                    scope_type,
                    scope_id,
                    metric,
                    period_start
           ),

   CONSTRAINT usage_counters_scope_type_check
       CHECK (scope_type IN ('user', 'team')),

   CONSTRAINT usage_counters_used_check
       CHECK (used >= 0)
);

-- enable row level security
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.increment_usage_counter(
    p_scope_type text,
    p_scope_id uuid,
    p_metric text,
    p_period_start date,
    p_increment bigint
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO ''
AS $function$
BEGIN
    -- check p_increment is positive
    IF p_increment <= 0 THEN
        RAISE EXCEPTION 'Increment must be positive'
        USING ERRCODE = '22023';
    END IF;

    -- Increment the usage counter for the specified scope, metric, and period
    UPDATE public.usage_counters
        SET used = used + p_increment
    WHERE scope_type = p_scope_type
      AND scope_id = p_scope_id
      AND metric = p_metric
      AND period_start = p_period_start;

    IF NOT FOUND THEN
        INSERT INTO public.usage_counters (scope_type, scope_id, metric, period_start, used)
        VALUES (p_scope_type, p_scope_id, p_metric, p_period_start, p_increment);
    END IF;
END;
$function$;


CREATE OR REPLACE FUNCTION public.create_link(
    p_team_id uuid,
    p_host_id uuid,
    p_slug text,
    p_destination text,
    p_domain text,
    p_subdomain text DEFAULT NULL,
    p_created_by_ip inet DEFAULT NULL,
    p_created_by_country_code text DEFAULT NULL,
    p_name text DEFAULT NULL,
    p_utm_source text DEFAULT NULL,
    p_utm_medium text DEFAULT NULL,
    p_utm_campaign text DEFAULT NULL,
    p_utm_content text DEFAULT NULL,
    p_utm_term text DEFAULT NULL,
    p_utm_id text DEFAULT NULL,
    p_expires_in integer DEFAULT NULL
)
RETURNS TABLE (
    link_id uuid,
    slug text,
    host_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_link_id uuid;
    v_created_by uuid;
    v_expires_at timestamptz;
    v_has_usage_capacity boolean;
BEGIN

    v_created_by := auth.uid();

    /*
     * Validaciones básicas
     */

    IF p_destination IS NULL OR btrim(p_destination) = '' THEN
        RAISE EXCEPTION 'DESTINATION_REQUIRED'
            USING ERRCODE = '22023';
    END IF;

    IF p_slug IS NULL OR btrim(p_slug) = '' THEN
        RAISE EXCEPTION 'SLUG_REQUIRED'
            USING ERRCODE = '22023';
    END IF;

    IF p_slug !~ '^[A-Za-z0-9_-]{3,32}$' THEN
        RAISE EXCEPTION 'INVALID_SLUG'
            USING ERRCODE = '22023';
    END IF;

    IF p_expires_in IS NOT NULL AND p_expires_in <= 0 THEN
        RAISE EXCEPTION 'INVALID_EXPIRES_IN'
            USING ERRCODE = '22023';
    END IF;


    /*
     * Si se especifica host_id, debe pertenecer al mismo Team.
     *
     * Esto es importante porque:
     *
     * team A -> host acme.iny.one
     * team B -> no puede crear links usando ese host.
     */

    IF p_host_id IS NOT NULL THEN

        IF NOT EXISTS (
            SELECT 1
            FROM public.link_hosts lh
            WHERE lh.host_id = p_host_id
              AND lh.team_id = p_team_id
              AND lh.status = 'active'
        ) THEN
            RAISE EXCEPTION 'INVALID_LINK_HOST'
                USING ERRCODE = '23503';
        END IF;

    END IF;


    /*
     * Validar que el usuario pertenezca al Team.
     *
     * Aquí asumimos que team_members tiene:
     * team_id, user_id
     */

    IF p_team_id IS NOT NULL OR v_created_by IS NOT NULL THEN

      IF NOT EXISTS (
          SELECT 1
          FROM public.team_members tm
          WHERE tm.team_id = p_team_id
            AND tm.user_id = v_created_by
      ) THEN
          RAISE EXCEPTION 'USER_NOT_TEAM_MEMBER'
              USING ERRCODE = '42501';
      END IF;

    END IF;

    IF v_created_by IS NOT NULL THEN
       -- Check rate limit for user with usage_counters table
          -- Check if the user has exceeded the limit of 100 links per month

        SELECT public.has_usage_capacity(
            (select service_id from public.get_effective_service() as service_id),
            'user',
            v_created_by,
            'links.create',
            'links.max_per_month',
            date_trunc('month', now())::date,
            1
        ) INTO v_has_usage_capacity;

       IF NOT v_has_usage_capacity THEN
            RAISE EXCEPTION 'USER_LINK_CREATION_LIMIT_EXCEEDED'
                 USING ERRCODE = '42999';
          IF (SELECT used FROM public.usage_counters WHERE scope_type = 'user' AND scope_id = v_created_by AND metric = 'links.create' AND period_start = date_trunc('month', now())::date) >= 100 THEN

          END IF;
    END IF;

    /*
     * Calcular expiración.
     */

    IF p_expires_in IS NOT NULL THEN
        v_expires_at := now() + make_interval(
            days => p_expires_in
        );
    END IF;


    /*
     * Crear link.
     *
     * link_id es la identidad interna.
     * (host_id, slug) es la identidad pública.
     */

    INSERT INTO public.short_links (
        link_id,
        team_id,
        host_id,
        slug,
        destination,
        name,
        status,
        created_by,
        created_by_ip,
        created_by_country_code,
        expires_in,
        expires_at
    )
    VALUES (
        gen_random_uuid(),
        p_team_id,
        p_host_id,
        p_slug,
        p_destination,
        p_name,
        'active',
        v_created_by,
        p_created_by_ip,
        p_created_by_country_code,
        p_expires_in,
        v_expires_at
    )
    RETURNING
        short_links.link_id,
        short_links.slug,
        short_links.host_id
    INTO
        v_link_id,
        slug,
        host_id;


    /*
     * Crear configuración UTM.
     *
     * Se crea siempre el registro para mantener
     * la relación 1:1 simple.
     */

    INSERT INTO public.utms (
        link_id,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        utm_id
    )
    VALUES (
        v_link_id,
        p_utm_source,
        p_utm_medium,
        p_utm_campaign,
        p_utm_content,
        p_utm_term,
        p_utm_id
    );


    /*
     * Crear metadata del destino.
     *
     * domain debería venir calculado/validado por la
     * capa de aplicación o por una función específica.
     */

    INSERT INTO public.link_destinations (
        link_id,
        domain,
        subdomain,
        validation_status
    )
    VALUES (
        v_link_id,
        p_domain,
        p_subdomain,
        'pending'
    );

    -- Incrementar contador de uso para el usuario que creó el link.
    SELECT public.increment_usage_counter(
        'user',
        v_created_by,
        'links.create',
        date_trunc('month', now())::date,
        1
    );

    /*
     * Retornar resultado.
     */

    link_id := v_link_id;

    RETURN NEXT;

EXCEPTION
    /*
     * No hacemos ROLLBACK manual.
     * PostgreSQL revierte automáticamente la transacción
     * de la función si ocurre una excepción.
     */

    WHEN unique_violation THEN
        RAISE EXCEPTION 'SLUG_ALREADY_EXISTS'
            USING ERRCODE = '23505';

END;
$$;
