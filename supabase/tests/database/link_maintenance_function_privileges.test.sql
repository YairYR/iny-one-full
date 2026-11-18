begin;
select plan(9);

select ok(
  not has_function_privilege(
    'anon',
    'public.click_short_link(text,uuid,text,text,text,text,text,text,text,boolean,text,text,text,text,text,text,text,text)',
    'EXECUTE'
  )
  and not has_function_privilege(
    'authenticated',
    'public.click_short_link(text,uuid,text,text,text,text,text,text,text,boolean,text,text,text,text,text,text,text,text)',
    'EXECUTE'
  ),
  'anon y authenticated no pueden ejecutar click_short_link'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.click_short_link(text,uuid,text,text,text,text,text,text,text,boolean,text,text,text,text,text,text,text,text)',
    'EXECUTE'
  ),
  'service_role puede ejecutar click_short_link'
);

select ok(
  not has_function_privilege('anon', 'public.fn_verify_shortlink_expired()', 'EXECUTE')
  and not has_function_privilege('authenticated', 'public.fn_verify_shortlink_expired()', 'EXECUTE'),
  'anon y authenticated no pueden ejecutar fn_verify_shortlink_expired'
);

select ok(
  has_function_privilege('service_role', 'public.fn_verify_shortlink_expired()', 'EXECUTE'),
  'service_role puede ejecutar fn_verify_shortlink_expired'
);

select ok(
  to_regprocedure('public.aggregate_daily_link_stats(date,date)') is null
  and to_regprocedure('security.aggregate_daily_link_stats(date,date)') is not null,
  'aggregate_daily_link_stats existe en security y no en public'
);

select ok(
  not has_function_privilege('anon', 'security.aggregate_daily_link_stats(date,date)', 'EXECUTE')
  and not has_function_privilege('authenticated', 'security.aggregate_daily_link_stats(date,date)', 'EXECUTE')
  and not has_function_privilege('service_role', 'security.aggregate_daily_link_stats(date,date)', 'EXECUTE'),
  'anon, authenticated y service_role no pueden ejecutar la agregación'
);

select ok(
  has_function_privilege('postgres', 'security.aggregate_daily_link_stats(date,date)', 'EXECUTE'),
  'postgres conserva EXECUTE en la agregación'
);

set local role postgres;
select lives_ok(
  $$select security.aggregate_daily_link_stats('2000-01-02'::date, '2000-01-01'::date)$$,
  'postgres puede ejecutar la agregación con un intervalo vacío'
);
reset role;

select is(
  (
    select count(*)::integer from cron.job
    where schedule = '5 0 * * *'
      and username = 'postgres'
      and database = 'postgres'
      and nodename = 'localhost'
      and nodeport = 5432
      and active
      and lower(regexp_replace(command, '[[:space:]]+', '', 'g')) =
          lower(regexp_replace($command$
            select security.aggregate_daily_link_stats(
              (select (CURRENT_TIMESTAMP - interval '1 day')::date),
              CURRENT_TIMESTAMP::date
            );
          $command$, '[[:space:]]+', '', 'g'))
  ),
  1,
  'cron conserva el horario y las fechas con la función en security'
);

select * from finish();
rollback;
