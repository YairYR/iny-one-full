create or replace function get_link_breakdown(
  p_slug text,
  p_from date default (current_date - interval '30 days')::date,
  p_to date default current_date
)
returns jsonb
language sql
security invoker
as $$
select jsonb_build_object(
               'by_country', (
            select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
            from (
                     select country_code, count(*) as clicks
                     from history_clicks
                     where slug = p_slug and is_bot = false
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
                            where slug = p_slug and is_bot = false
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
                            where slug = p_slug and is_bot = false
                              and created_at::date between p_from and p_to
                            group by browser
                            order by clicks desc
                                limit 10
                        ) t
               )
       );
$$;