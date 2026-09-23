DROP FUNCTION IF EXISTS public.get_page_clicks_between_dates(text[], timestamp with time zone, timestamp with time zone);
DROP FUNCTION IF EXISTS public.get_page_traffic(text[]);
DROP FUNCTION IF EXISTS public.get_link_breakdown(text, date, date);
DROP FUNCTION IF EXISTS public.get_dashboard_stats_summary(text[], timestamp without time zone, timestamp without time zone, text);

CREATE OR REPLACE FUNCTION public.get_page_traffic(p_link_ids uuid[])
 RETURNS TABLE(referer text, count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$begin
  return query
select
    COALESCE(h.referer, '') as referer,
    count(*) as count
from public.history_clicks as h
where
    h.link_id = ANY(p_link_ids)
  and (
    h.referer is null
   or (
    h.referer not like 'https://www.iny.one%'
  and h.referer not like 'https://iny.one%'
    )
    )
group by h.referer;
end;$function$;


CREATE OR REPLACE FUNCTION public.get_link_breakdown(p_link_id uuid, p_from date DEFAULT ((CURRENT_DATE - '30 days'::interval))::date, p_to date DEFAULT CURRENT_DATE)
 RETURNS jsonb
 LANGUAGE sql
AS $function$
select jsonb_build_object(
               'by_country', (
            select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
            from (
                     select country_code, count(*) as clicks
                     from history_clicks
                     where link_id = p_link_id and is_bot = false
                       and created_at::date between p_from and p_to
                     group by country_code
                     order by clicks desc
                         limit 15
                 ) t
        ),
               'by_device', (
                   select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
                   from (
                            select device_type, count(*) as clicks
                            from history_clicks
                            where link_id = p_link_id and is_bot = false
                              and created_at::date between p_from and p_to
                            group by device_type
                            order by clicks desc
                        ) t
               ),
               'by_browser', (
                   select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
                   from (
                            select browser, count(*) as clicks
                            from history_clicks
                            where link_id = p_link_id and is_bot = false
                              and created_at::date between p_from and p_to
                            group by browser
                            order by clicks desc
                                limit 10
                        ) t
               )
       );
$function$;

CREATE OR REPLACE FUNCTION public.get_dashboard_stats_summary(p_link_ids uuid[], p_start_date timestamp without time zone, p_end_date timestamp without time zone, p_date_grouping text DEFAULT 'day'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$DECLARE
  day_stats jsonb := '[]'::jsonb;
  top_countries jsonb := '[]'::jsonb;
  top_browsers jsonb := '[]'::jsonb;
  clicks_summary int8 := 0;
  clicks_all_time int8 := 0;
  clicks_last_24h int8 := 0;
BEGIN

  IF p_date_grouping NOT IN ('day', 'week', 'month') THEN
    RAISE EXCEPTION 'Invalid date_grouping: %', p_date_grouping
      USING ERRCODE = '22023';
END IF;

  -- Agrega day stats
SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) INTO day_stats
FROM (
         SELECT
             date_trunc(p_date_grouping, date)::date AS date,
      SUM(total_clicks) as clicks
         FROM public.short_links_daily_stats
         WHERE link_id = ANY(p_link_ids) AND date >= p_start_date::date AND date <= p_end_date::date
         GROUP BY 1
         ORDER BY 1 ASC
     ) t;

select count(*) into clicks_last_24h
from public.history_clicks as h
where
    h.link_id = ANY(p_link_ids)
  and h.created_at >= (CURRENT_TIMESTAMP - INTERVAL '1 day')
  and h.created_at <= CURRENT_TIMESTAMP;

select count(*) into clicks_summary
from public.history_clicks as h
where
    h.link_id = ANY(p_link_ids)
  and h.created_at >= p_start_date
  and h.created_at <= p_end_date;

SELECT
    SUM(total_clicks::int) into clicks_all_time
FROM public.short_links_stats t
where link_id = ANY(p_link_ids)
    LIMIT 1;

SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) INTO top_countries
FROM (
         SELECT
             pairs.key as name,
             SUM(pairs.value::int) as value
         FROM public.short_links_stats t,
             jsonb_each_text(t.country_counts) pairs
         where link_id = ANY(p_link_ids)
         GROUP BY pairs.key
         ORDER BY SUM(pairs.value::int) DESC
             LIMIT 3
     ) t;

SELECT coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb) INTO top_browsers
FROM (
         SELECT
             pairs.key as name,
             SUM(pairs.value::int) as value
         FROM public.short_links_stats t,
             jsonb_each_text(t.browser_counts) pairs
         where link_id = ANY(p_link_ids)
         GROUP BY pairs.key
         ORDER BY SUM(pairs.value::int) DESC
             LIMIT 3
     ) t;

return jsonb_build_object(
        'summary', jsonb_build_object(
                'clicks', clicks_summary,
                'clicks_last_24h', clicks_last_24h,
                'stats', day_stats,
                'date_start', p_start_date,
                'date_end', p_end_date,
                'date_grouping', p_date_grouping
                   ),
        'all_time', jsonb_build_object(
                'clicks', clicks_all_time,
                'top_countries', top_countries,
                'top_browsers', top_browsers
                    )
       );
END;$function$;
