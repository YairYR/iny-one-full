begin;
select plan(12);

select ok(
  has_function_privilege(
    'anon',
    'public.create_link(uuid,uuid,text,text,text,text,inet,text,text,text,text,text,text,text,text,integer)',
    'EXECUTE'
  ),
  'anon puede ejecutar create_link'
);
select ok(
  not has_function_privilege(
    'service_role',
    'public.create_link(uuid,uuid,text,text,text,text,inet,text,text,text,text,text,text,text,text,integer)',
    'EXECUTE'
  ),
  'service_role no puede ejecutar create_link'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.create_link(uuid,uuid,text,text,text,text,inet,text,text,text,text,text,text,text,text,integer)',
    'EXECUTE'
  ),
  'authenticated puede ejecutar create_link'
);
select ok(
  case
    when to_regprocedure('public.create_link(uuid,uuid,text,text,text,text,uuid,inet,text,text,text,text,text,text,text,text,integer)') is null then true
    else not has_function_privilege('anon',
      'public.create_link(uuid,uuid,text,text,text,text,uuid,inet,text,text,text,text,text,text,text,text,integer)', 'EXECUTE')
      and not has_function_privilege('authenticated',
      'public.create_link(uuid,uuid,text,text,text,text,uuid,inet,text,text,text,text,text,text,text,text,integer)', 'EXECUTE')
      and not has_function_privilege('service_role',
      'public.create_link(uuid,uuid,text,text,text,text,uuid,inet,text,text,text,text,text,text,text,text,integer)', 'EXECUTE')
  end,
  'los roles de la API no pueden usar la sobrecarga con created_by'
);

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select lives_ok(
  $$select * from public.create_link(null, null, 'test-anon-link', 'https://example.com', 'example.com', null::text, '203.0.113.10'::inet)$$,
  'anon puede crear un enlace sin equipo'
);
reset role;

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok(
  $$select * from public.create_link(gen_random_uuid(), null, 'test-anon-team', 'https://example.com', 'example.com')$$,
  '42501', 'ANONYMOUS_TEAM_NOT_ALLOWED',
  'anon no puede crear enlaces dentro de un equipo'
);
reset role;

select is(
  (select created_by from public.short_links where slug = 'test-anon-link' and host_id is null),
  null::uuid,
  'anon no asigna un creador'
);

insert into auth.users (id, email)
values ('00000000-0000-0000-0000-0000000000a2', 'create-link-test@test.local');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a2', true);
select public.ensure_personal_team();
select set_config(
  'test.create_link_team',
  (select default_team_id::text from public.users_profiles where id = '00000000-0000-0000-0000-0000000000a2'),
  true
);

set local role authenticated;
select lives_ok(
  $$select * from public.create_link(
    current_setting('test.create_link_team')::uuid, null, 'test-auth-link',
    'https://example.com', 'example.com', null::text, null::inet, p_utm_source => 'test'
  )$$,
  'un usuario autenticado puede crear un enlace'
);
select throws_ok(
  $$select * from public.create_link(
    current_setting('test.create_link_team')::uuid, null, 'test-auth-link',
    'https://example.com', 'example.com', null::text, null::inet
  )$$,
  '23505', 'SLUG_ALREADY_EXISTS',
  'un slug duplicado devuelve un conflicto'
);
reset role;

select is(
  (select created_by from public.short_links where slug = 'test-auth-link' and host_id is null),
  '00000000-0000-0000-0000-0000000000a2'::uuid,
  'el creador se obtiene de la sesión'
);
select is(
  (select used from public.usage_counters
    where scope_type = 'user' and scope_id = '00000000-0000-0000-0000-0000000000a2'
      and metric = 'links.create' and period_start = date_trunc('month', now())::date),
  1::bigint,
  'el contador incrementa solo por la creación exitosa'
);
select is(
  (select u.utm_source from public.utms u join public.short_links l on l.link_id = u.link_id
    where l.slug = 'test-auth-link' and l.host_id is null),
  'test',
  'la configuración UTM se guarda con el enlace'
);

select * from finish();
rollback;
