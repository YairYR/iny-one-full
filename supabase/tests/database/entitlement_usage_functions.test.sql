begin;
select plan(12);

select ok(
  not has_function_privilege('anon', 'public.get_entitlement_limit(uuid,text)', 'EXECUTE'),
  'anon no puede ejecutar get_entitlement_limit'
);
select ok(
  not has_function_privilege('authenticated', 'public.get_entitlement_limit(uuid,text)', 'EXECUTE'),
  'authenticated no puede ejecutar get_entitlement_limit'
);

select ok(
  not has_function_privilege('anon', 'public.get_usage(text,uuid,text,date)', 'EXECUTE'),
  'anon no puede ejecutar get_usage'
);
select ok(
  not has_function_privilege('authenticated', 'public.get_usage(text,uuid,text,date)', 'EXECUTE'),
  'authenticated no puede ejecutar get_usage'
);

select ok(
  not has_function_privilege('anon', 'public.has_usage_capacity(uuid,text,uuid,text,text,date,bigint)', 'EXECUTE'),
  'anon no puede ejecutar has_usage_capacity'
);
select ok(
  not has_function_privilege('authenticated', 'public.has_usage_capacity(uuid,text,uuid,text,text,date,bigint)', 'EXECUTE'),
  'authenticated no puede ejecutar has_usage_capacity'
);

select ok(
  has_function_privilege('service_role', 'public.get_entitlement_limit(uuid,text)', 'EXECUTE')
  and has_function_privilege('service_role', 'public.get_usage(text,uuid,text,date)', 'EXECUTE')
  and has_function_privilege('service_role', 'public.has_usage_capacity(uuid,text,uuid,text,text,date,bigint)', 'EXECUTE'),
  'service_role conserva EXECUTE (el revoke a PUBLIC también se lo quita)'
);

-- Las políticas RLS la evalúan como authenticated: si pierde EXECUTE, se rompen.
select ok(
  not has_function_privilege('anon', 'public.has_entitlement_enabled(uuid,text)', 'EXECUTE'),
  'anon no puede ejecutar has_entitlement_enabled'
);
select ok(
  has_function_privilege('authenticated', 'public.has_entitlement_enabled(uuid,text)', 'EXECUTE'),
  'authenticated conserva has_entitlement_enabled (la usan link_hosts_insert y teams_insert)'
);
select ok(
  has_function_privilege('service_role', 'public.has_entitlement_enabled(uuid,text)', 'EXECUTE'),
  'service_role conserva has_entitlement_enabled'
);

-- La app las llama con el cliente de sesión, también sin sesión.
select ok(
  has_function_privilege('anon', 'public.get_access_context()', 'EXECUTE')
  and has_function_privilege('authenticated', 'public.get_access_context()', 'EXECUTE'),
  'get_access_context sigue abierta a anon y authenticated'
);
select ok(
  has_function_privilege('anon', 'public.get_effective_service()', 'EXECUTE')
  and has_function_privilege('authenticated', 'public.get_effective_service()', 'EXECUTE'),
  'get_effective_service sigue abierta a anon y authenticated'
);

select * from finish();
rollback;
