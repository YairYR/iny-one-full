begin;
select plan(4);

-- has_function_privilege incluye lo heredado de PUBLIC, que es por donde llegaba el grant.
select ok(
  not has_function_privilege('anon', 'public.get_page_traffic(uuid[])', 'EXECUTE'),
  'anon no puede ejecutar get_page_traffic'
);

select ok(
  not has_function_privilege('authenticated', 'public.get_page_traffic(uuid[])', 'EXECUTE'),
  'authenticated no puede ejecutar get_page_traffic'
);

select ok(
  has_function_privilege('service_role', 'public.get_page_traffic(uuid[])', 'EXECUTE'),
  'service_role conserva EXECUTE (el revoke a PUBLIC también se lo quita)'
);

select lives_ok(
  $$select * from public.get_page_traffic(array[gen_random_uuid()])$$,
  'get_page_traffic ejecuta con un link_id inexistente'
);

select * from finish();
rollback;
