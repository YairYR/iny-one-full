-- (a) `security.is_domain_secure` estaba rota en la rama que importa: la de
--     `blocked_url` insertaba TRES valores en DOS columnas y lanzaba
--     «42601: INSERT has more expressions than target columns» cada vez que un
--     dominio SÍ estaba bloqueado. La app fallaba cerrada (rechazaba el enlace),
--     pero el bloqueo no se cacheaba nunca y el usuario veía un error genérico.
--     Por eso `blocked_url`, con 2,3 millones de filas, acumulaba seis escaneos
--     de índice en toda su vida.
--
-- (b) El whitelist se consultaba ANTES que el blocklist y además se
--     auto-alimentaba: un dominio comprobado mientras estaba limpio quedaba
--     permitido para siempre aunque después entrara en la lista. Ahora el
--     whitelist sólo gana si es una excepción puesta a mano (`is_custom`), y no
--     se escribe solo.

create or replace function security.is_domain_secure(domain_to_check text)
returns boolean
language plpgsql
set search_path to 'security'
as $function$
declare
  domain_found text;
  domain_is_custom bool;
begin
  -- 1. Caché de bloqueados: la respuesta más frecuente y la más barata.
  select domain into domain_found
  from security.cached_blocked_url
  where domain = domain_to_check
  limit 1;

  if domain_found is not null then
    return false;
  end if;

  -- 2. Excepciones puestas a mano. Sólo `is_custom`: una entrada que llegó ahí
  --    sola no puede ganarle a un bloqueo posterior.
  select domain into domain_found
  from security.whitelist_url
  where domain = domain_to_check and is_custom
  limit 1;

  if domain_found is not null then
    return true;
  end if;

  -- 3. Blocklist principal.
  select domain, is_custom into domain_found, domain_is_custom
  from security.blocked_url
  where domain = domain_to_check
  limit 1;

  if domain_found is not null then
    insert into security.cached_blocked_url (domain, is_custom, is_permanent)
    values (domain_to_check, domain_is_custom, domain_is_custom)
    on conflict (domain) do nothing;
    return false;
  end if;

  -- 4. Phishing activo.
  select domain into domain_found
  from security.blocklist_url_phishing_active
  where domain = domain_to_check
  limit 1;

  if domain_found is not null then
    insert into security.cached_blocked_url (domain, is_custom, is_permanent)
    values (domain_to_check, false, false)
    on conflict (domain) do nothing;
    return false;
  end if;

  -- 5. Desconocido: se permite, pero NO se memoriza como permitido.
  return true;
end;
$function$;

revoke all on function security.is_domain_secure(text) from public, anon, authenticated;
grant execute on function security.is_domain_secure(text) to service_role;

-- `fn_log_audit` es el trigger de auditoría de `subscriptions` y `authorize`
-- resuelve permisos: ninguna tiene motivo para ser invocable por RPC desde
-- fuera. Revocar a `public` es lo que de verdad las cierra.
revoke all on function public.fn_log_audit() from public, anon, authenticated;
grant execute on function public.fn_log_audit() to service_role;

revoke all on function public.authorize(public.app_permission) from public, anon;
grant execute on function public.authorize(public.app_permission) to authenticated, service_role;;
