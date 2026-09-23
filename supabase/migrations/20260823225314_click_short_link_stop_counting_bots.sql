-- Los dos contadores de clics medían cosas distintas con el mismo nombre:
-- `click_short_link` incrementaba `short_links.clicks` SIEMPRE, mientras que el
-- trigger `update_short_links_stats` hace `RETURN new` cuando `is_bot`. Uno
-- contaba bots y el otro no, así que 347 enlaces divergían y la cifra crecía.
-- El ranking de mejores enlaces del dashboard usa el contador inflado.
--
-- Se decide que la verdad es el número sin bots, que es el que se le enseña al
-- usuario. A partir de aquí ambos contadores cuentan lo mismo.
--
-- El historial en `history_clicks` sigue guardando el clic del bot: sirve para
-- diagnosticar, y no es lo que se muestra.
--
-- NO se reescriben los 347 desfases existentes: eso cambiaría hacia abajo cifras
-- que el usuario ya ha visto, y es una decisión aparte. La consulta de conciliación
-- queda anotada al final, sin ejecutar.

create or replace function public.click_short_link(
  page_slug text, user_ip text, user_country_code text, user_region text,
  user_city text, user_latitude text, user_longitude text, user_ua text,
  user_is_bot boolean, user_browser text, user_browser_version text,
  user_device_type text, user_device_vendor text, user_device_model text,
  user_os text, user_os_version text, user_referer text)
returns void
language plpgsql
set search_path to 'public'
as $function$
declare
  page_found text;
  page_domain text;
  page_utm_source text;
  page_utm_medium text;
  page_utm_campaign text;
  page_utm_content text;
  page_utm_term text;
  page_utm_id text;
begin
  select
    destination, domain, utm_source, utm_medium,
    utm_campaign, utm_content, utm_term, utm_id
  into
    page_found, page_domain, page_utm_source, page_utm_medium,
    page_utm_campaign, page_utm_content, page_utm_term, page_utm_id
  from public.short_links
  where slug = page_slug;

  if page_found is null then
    return;
  end if;

  -- Mismo criterio que `update_short_links_stats`: los bots no cuentan.
  if not user_is_bot then
    update public.short_links
      set clicks = clicks + 1
    where slug = page_slug;
  end if;

  insert into public.history_clicks (
    slug, ip, country_code, region, city, domain,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id,
    latitude, longitude, user_agent, is_bot, browser, browser_version,
    device_type, device_vendor, device_model, os, os_version, referer
  ) values (
    page_slug, user_ip, user_country_code, user_region, user_city, page_domain,
    page_utm_source, page_utm_medium, page_utm_campaign, page_utm_content, page_utm_term, page_utm_id,
    user_latitude, user_longitude, user_ua, user_is_bot, user_browser, user_browser_version,
    user_device_type, user_device_vendor, user_device_model, user_os, user_os_version, user_referer
  );
end;
$function$;

-- Conciliación del histórico, PENDIENTE DE DECISIÓN. Baja las cifras ya
-- mostradas al valor sin bots:
--
--   update public.short_links l
--   set clicks = s.total_clicks
--   from public.short_links_stats s
--   where s.slug = l.slug and coalesce(l.clicks, 0) <> coalesce(s.total_clicks, 0);;
