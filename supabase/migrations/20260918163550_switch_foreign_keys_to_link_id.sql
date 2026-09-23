BEGIN;


-- ============================================================
-- short_links_stats
-- ============================================================

ALTER TABLE public.short_links_stats
DROP CONSTRAINT short_links_stats_slug_fkey;

ALTER TABLE public.short_links_stats
    ADD CONSTRAINT short_links_stats_link_fkey
        FOREIGN KEY (link_id)
            REFERENCES public.short_links(link_id)
            ON DELETE CASCADE;


-- ============================================================
-- daily stats
-- ============================================================

ALTER TABLE public.short_links_daily_stats
DROP CONSTRAINT short_links_daily_stats_slug_fkey;

ALTER TABLE public.short_links_daily_stats
    ADD CONSTRAINT short_links_daily_stats_link_fkey
        FOREIGN KEY (link_id)
            REFERENCES public.short_links(link_id)
            ON DELETE CASCADE;


-- ============================================================
-- monthly stats
-- ============================================================

ALTER TABLE public.short_links_monthly_stats
DROP CONSTRAINT short_links_monthly_stats_slug_fkey;

ALTER TABLE public.short_links_monthly_stats
    ADD CONSTRAINT short_links_monthly_stats_link_fkey
        FOREIGN KEY (link_id)
            REFERENCES public.short_links(link_id)
            ON DELETE CASCADE;


-- ============================================================
-- destination changes
-- ============================================================

ALTER TABLE public.short_link_destination_changes
DROP CONSTRAINT short_link_destination_changes_slug_fkey;

ALTER TABLE public.short_link_destination_changes
    ADD CONSTRAINT short_link_destination_changes_link_fkey
        FOREIGN KEY (link_id)
            REFERENCES public.short_links(link_id)
            ON DELETE CASCADE;


-- ============================================================
-- history clicks
-- ============================================================

ALTER TABLE public.history_clicks
DROP CONSTRAINT history_clicks_slug_fkey;

ALTER TABLE public.history_clicks
    ADD CONSTRAINT history_clicks_link_fkey
        FOREIGN KEY (link_id)
            REFERENCES public.short_links(link_id)
            ON DELETE CASCADE;


-- ============================================================
-- update functions
-- ============================================================


-- ============================================================
-- Function: click_short_link
-- ============================================================

CREATE OR REPLACE FUNCTION public.click_short_link(page_slug text, user_ip text, user_country_code text, user_region text, user_city text, user_latitude text, user_longitude text, user_ua text, user_is_bot boolean, user_browser text, user_browser_version text, user_device_type text, user_device_vendor text, user_device_model text, user_os text, user_os_version text, user_referer text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  page_link_id uuid;
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
    link_id, destination, domain, utm_source, utm_medium,
    utm_campaign, utm_content, utm_term, utm_id
into
    page_link_id, page_found, page_domain, page_utm_source, page_utm_medium,
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
    link_id, slug, ip, country_code, region, city, domain,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id,
    latitude, longitude, user_agent, is_bot, browser, browser_version,
    device_type, device_vendor, device_model, os, os_version, referer
) values (
             page_link_id, page_slug, user_ip, user_country_code, user_region, user_city, page_domain,
             page_utm_source, page_utm_medium, page_utm_campaign, page_utm_content, page_utm_term, page_utm_id,
             user_latitude, user_longitude, user_ua, user_is_bot, user_browser, user_browser_version,
             user_device_type, user_device_vendor, user_device_model, user_os, user_os_version, user_referer
         );
end;
$function$;


-- ============================================================
-- Function: update_short_links_daily_monthly_stats
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_short_links_daily_monthly_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$declare
  click_date date := new.created_at::date;
  click_year int := extract(year from new.created_at);
  click_month int := extract(month from new.created_at);

  -- Normalización: NULL o '' → 'unknown'
  v_country text := coalesce(nullif(new.country_code, ''), 'unknown');
  v_browser text := coalesce(nullif(new.browser, ''), 'unknown');
  v_os text := coalesce(nullif(new.os, ''), 'unknown');
  v_device_type text := coalesce(nullif(new.device_type, ''), 'unknown');
begin

-- Ignorar bots
IF new.is_bot THEN
  RETURN new;
END IF;

  -------------------------------------
  -- DAILY STATS
  -------------------------------------
insert into public.short_links_daily_stats (link_id, date)
values (new.link_id, click_date)
    on conflict (link_id, date) do nothing;

update public.short_links_daily_stats
set
    total_clicks = total_clicks + 1,
    unique_ips = (
        select count(distinct ip)
        from public.history_clicks
        where link_id = new.link_id
          and is_bot = false
          and created_at::date = click_date
    ),
    country_counts = jsonb_set(
    country_counts,
    array[v_country],
    to_jsonb( coalesce((country_counts ->> v_country)::int, 0) + 1 ),
    true
    ),
    browser_counts = jsonb_set(
    browser_counts,
    array[v_browser],
    to_jsonb( coalesce((browser_counts ->> v_browser)::int, 0) + 1 ),
    true
    ),
    os_counts = jsonb_set(
    os_counts,
    array[v_os],
    to_jsonb( coalesce((os_counts ->> v_os)::int, 0) + 1 ),
    true
    ),
    device_type_counts = jsonb_set(
    device_type_counts,
    array[v_device_type],
    to_jsonb( coalesce((device_type_counts ->> v_device_type)::int, 0) + 1 ),
    true
    ),
    updated_at = now()
where link_id = new.link_id and date = click_date;



-------------------------------------
-- MONTHLY STATS
-------------------------------------
insert into public.short_links_monthly_stats (link_id, year, month)
values (new.link_id, click_year, click_month)
    on conflict (link_id, year, month) do nothing;

update public.short_links_monthly_stats
set
    total_clicks = total_clicks + 1,
    unique_ips = (
        select count(distinct ip)
        from public.history_clicks
        where link_id = new.link_id
          and is_bot = false
          and extract(year from created_at) = click_year
          and extract(month from created_at) = click_month
    ),
    country_counts = jsonb_set(
            country_counts,
            array[v_country],
            to_jsonb( coalesce((country_counts ->> v_country)::int, 0) + 1 ),
            true
                     ),
    browser_counts = jsonb_set(
            browser_counts,
            array[v_browser],
            to_jsonb( coalesce((browser_counts ->> v_browser)::int, 0) + 1 ),
            true
                     ),
    os_counts = jsonb_set(
            os_counts,
            array[v_os],
            to_jsonb( coalesce((os_counts ->> v_os)::int, 0) + 1 ),
            true
                ),
    device_type_counts = jsonb_set(
            device_type_counts,
            array[v_device_type],
            to_jsonb( coalesce((device_type_counts ->> v_device_type)::int, 0) + 1 ),
            true
                         ),
    updated_at = now()
where link_id = new.link_id
          and year = click_year
          and month = click_month;

return new;
end;$function$;


-- ============================================================
-- Function: update_short_links_stats
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_short_links_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$declare
  -- Normalización: NULL o '' → 'unknown'
  v_country text := coalesce(nullif(new.country_code, ''), 'unknown');
  v_browser text := coalesce(nullif(new.browser, ''), 'unknown');
  v_os text := coalesce(nullif(new.os, ''), 'unknown');
  v_device_type text := coalesce(nullif(new.device_type, ''), 'unknown');
begin
  IF new.is_bot THEN
    RETURN new;
END IF;

  -- Asegurar fila existente en stats
insert into public.short_links_stats (link_id)
values (new.link_id)
    on conflict (link_id) do nothing;

-- Incrementar clicks
update public.short_links_stats
set
    total_clicks = total_clicks + 1,
    last_click_at = new.created_at,
    -- agrega 1 al país
    country_counts = jsonb_set(
            country_counts,
            array[v_country],
            to_jsonb(
                    coalesce((country_counts -> v_country)::text::int, 0) + 1
            ),
            true
                     ),
    -- browser
    browser_counts = jsonb_set(
            browser_counts,
            array[v_browser],
            to_jsonb(
                    coalesce((browser_counts -> v_browser)::text::int, 0) + 1
            ),
            true
                     ),
    -- os
    os_counts = jsonb_set(
            os_counts,
            array[v_os],
            to_jsonb(
                    coalesce((os_counts -> v_os)::text::int, 0) + 1
            ),
            true
                ),
    -- device_type
    device_type_counts = jsonb_set(
            device_type_counts,
            array[v_device_type],
            to_jsonb(
                    coalesce((device_type_counts -> v_device_type)::text::int, 0) + 1
            ),
            true
                         ),
    updated_at = now()
where link_id = new.link_id;

return new;
end;$function$;


-- ============================================================
-- Update triggers
-- ============================================================

CREATE OR REPLACE TRIGGER tr_history_clicks_after_insert AFTER INSERT ON public.history_clicks FOR EACH ROW EXECUTE FUNCTION public.update_short_links_stats();
CREATE OR REPLACE TRIGGER tr_history_clicks_daily_monthly AFTER INSERT ON public.history_clicks FOR EACH ROW EXECUTE FUNCTION public.update_short_links_daily_monthly_stats();

COMMIT;