-- Cierra `public.create_link` a `anon`.
--
-- APLICADO en producción el 2026-11-22 (SQL Editor de Supabase), en dos pasos
-- alrededor del despliegue del código que crea los enlaces anónimos con service role:
--
--   Paso 1 (antes del despliegue): la función acepta también `service_role` en la
--          rama sin usuario y exige caducidad. El código actual, que llama como
--          `anon`, sigue funcionando.
--   Paso 2 (después del despliegue): se revoca `EXECUTE` a `anon`.
--
-- Por qué: `create_link` es SECURITY DEFINER y `anon` podía ejecutarla con la clave
-- pública vía `/rest/v1/rpc/create_link`. Así se saltaba el blocklist
-- (`validateDestination` vive en la API; la función no valida dominios), la cuota
-- anónima (la función no la comprueba y la IP `p_created_by_ip` la elige quien
-- llama) y la caducidad (`p_expires_in` nulo dejaba un enlace anónimo permanente).
--
-- Comprobado en producción el 2026-11-22: el ACL era
-- {postgres=X, anon=X, authenticated=X}; PUBLIC ya no tenía EXECUTE.

-- ─── Paso 1 ─────────────────────────────────────────────────────────────────
begin;

CREATE OR REPLACE FUNCTION public.create_link(p_team_id uuid, p_host_id uuid, p_slug text, p_destination text, p_domain text, p_subdomain text DEFAULT NULL::text, p_created_by_ip inet DEFAULT NULL::inet, p_created_by_country_code text DEFAULT NULL::text, p_name text DEFAULT NULL::text, p_utm_source text DEFAULT NULL::text, p_utm_medium text DEFAULT NULL::text, p_utm_campaign text DEFAULT NULL::text, p_utm_content text DEFAULT NULL::text, p_utm_term text DEFAULT NULL::text, p_utm_id text DEFAULT NULL::text, p_expires_in integer DEFAULT NULL::integer)
 RETURNS TABLE(link_id uuid, slug text, host_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
    v_link_id uuid;
    v_created_by uuid := auth.uid();
    v_expires_at timestamptz;
    v_has_usage_capacity boolean;
begin
    if p_destination is null or btrim(p_destination) = '' then
        raise exception 'DESTINATION_REQUIRED' using errcode = '22023';
    end if;
    if p_slug is null or btrim(p_slug) = '' then
        raise exception 'SLUG_REQUIRED' using errcode = '22023';
    end if;
    if p_slug !~ '^[A-Za-z0-9_-]{3,32}$' then
        raise exception 'INVALID_SLUG' using errcode = '22023';
    end if;
    if p_expires_in is not null and p_expires_in <= 0 then
        raise exception 'INVALID_EXPIRES_IN' using errcode = '22023';
    end if;

    if p_host_id is not null and not exists (
        select 1 from public.link_hosts lh
        where lh.host_id = p_host_id and lh.team_id = p_team_id and lh.status = 'active'
    ) then
        raise exception 'INVALID_LINK_HOST' using errcode = '23503';
    end if;

    if v_created_by is null then
        -- La creación anónima la hace el servidor con service role, tras validar
        -- destino y cuota. `anon` sigue aceptado sólo hasta el paso 2, que le
        -- retira EXECUTE; después esta rama es inalcanzable para él.
        if coalesce(auth.jwt() ->> 'role', '') not in ('anon', 'service_role') then
            raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
        end if;
        -- El único modo soportado de creación anónima no pertenece a un equipo.
        -- Evita que una llamada RPC anónima tome un team_id ajeno o reservado.
        if p_team_id is not null then
            raise exception 'ANONYMOUS_TEAM_NOT_ALLOWED' using errcode = '42501';
        end if;
        -- Un enlace anónimo siempre caduca.
        if p_expires_in is null then
            raise exception 'ANONYMOUS_EXPIRY_REQUIRED' using errcode = '22023';
        end if;
    else
        if not exists (
            select 1 from public.team_members tm
            where tm.team_id = p_team_id
              and tm.user_id = v_created_by
              and tm.status = 'active'
        ) then
            raise exception 'USER_NOT_TEAM_MEMBER' using errcode = '42501';
        end if;

        select public.has_usage_capacity(
            (select service_id from public.get_effective_service() as service_id),
            'user',
            v_created_by,
            'links.create',
            'links.max_per_month',
            date_trunc('month', now())::date,
            1
        ) into v_has_usage_capacity;

        if not v_has_usage_capacity then
            raise exception 'USER_LINK_CREATION_LIMIT_EXCEEDED' using errcode = '42999';
        end if;
    end if;

    if p_expires_in is not null then
        v_expires_at := now() + make_interval(days => p_expires_in);
    end if;

    insert into public.short_links (
        link_id, team_id, host_id, slug, destination, name, status,
        created_by, created_by_ip, created_by_country_code, expires_in, expires_at
    ) values (
        gen_random_uuid(), p_team_id, p_host_id, p_slug, p_destination, p_name, 'active',
        v_created_by, p_created_by_ip, p_created_by_country_code, p_expires_in, v_expires_at
    )
    returning short_links.link_id, short_links.slug, short_links.host_id
    into v_link_id, slug, host_id;

    insert into public.utms (
        link_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id
    ) values (
        v_link_id, p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_utm_term, p_utm_id
    );

    insert into public.link_destinations (link_id, domain, subdomain, validation_status)
    values (v_link_id, p_domain, p_subdomain, 'pending');

    if v_created_by is not null then
        perform public.increment_usage_counter(
            'user', v_created_by, 'links.create', date_trunc('month', now())::date, 1
        );
    end if;

    link_id := v_link_id;
    return next;
exception
    when unique_violation then
        raise exception 'SLUG_ALREADY_EXISTS' using errcode = '23505';
end;
$function$;

grant execute on function public.create_link(uuid,uuid,text,text,text,text,inet,text,text,text,text,text,text,text,text,integer)
  to service_role;

commit;

-- ─── Paso 2 (tras desplegar el código) ──────────────────────────────────────
-- Se revoca también a PUBLIC por la trampa documentada en CLAUDE.md: `anon` hereda
-- de PUBLIC, y si alguien recrea la función sin `revoke`, PUBLIC vuelve a tenerlo.
begin;

revoke execute on function public.create_link(uuid,uuid,text,text,text,text,inet,text,text,text,text,text,text,text,text,integer)
  from public, anon;

-- Verificación: debe devolver anon=false, authenticated=true, service_role=true.
select has_function_privilege('anon', p.oid, 'EXECUTE') as anon,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated,
       has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role
from pg_proc p
where p.oid = 'public.create_link(uuid,uuid,text,text,text,text,inet,text,text,text,text,text,text,text,text,integer)'::regprocedure;

commit;
