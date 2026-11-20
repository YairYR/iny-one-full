begin;
select no_plan();
select set_config('request.jwt.claims', '{}', true);
select set_config('request.jwt.claim.sub', '', true);

select ok(has_function_privilege('anon', 'public.get_link_creation_access()', 'execute'),
  'anónimos pueden consultar el acceso para crear enlaces');
select ok(has_function_privilege('authenticated', 'public.get_link_creation_access()', 'execute'),
  'usuarios autenticados pueden consultar su acceso para crear enlaces');
select ok(not has_function_privilege('anon', 'public.get_default_team_access(text)', 'execute'),
  'anónimos no pueden consultar equipos');
select ok(has_function_privilege('authenticated', 'public.get_default_team_access(text)', 'execute'),
  'usuarios autenticados pueden consultar su equipo');

set local role anon;
select is(public.get_link_creation_access()->'anonymous', 'true'::jsonb,
  'el acceso anónimo conserva su identidad');
select is(public.get_link_creation_access()->'plan_key', public.get_access_context()->'plan_key',
  'el plan anónimo coincide con el contexto anterior');
select is(public.get_link_creation_access()->'monthly_limit',
  coalesce((select e->'value' from jsonb_array_elements(public.get_access_context()->'entitlements') e
    where e->>'key' = 'links.max_per_month' and jsonb_typeof(e->'value') = 'number'), 'null'::jsonb),
  'la cuota anónima coincide con el contexto anterior');
reset role;

insert into auth.users(id, email) values
  ('00000000-0000-0000-0000-0000000000d1', 'narrow-access-1@test.invalid'),
  ('00000000-0000-0000-0000-0000000000d2', 'narrow-access-2@test.invalid');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', true);
select set_config('test.narrow_team', public.ensure_personal_team()::text, true);

set local role authenticated;
select is(public.get_link_creation_access()->'anonymous', 'false'::jsonb, 'el usuario no es anónimo');
select is(public.get_link_creation_access()->'plan_key', public.get_access_context()->'plan_key',
  'el plan gratuito coincide con el contexto anterior');
select is(public.get_link_creation_access()->'default_team_id', public.get_access_context()->'default_team_id',
  'el equipo predeterminado coincide con el contexto anterior');
select is(public.get_link_creation_access()->'monthly_limit',
  coalesce((select e->'value' from jsonb_array_elements(public.get_access_context()->'entitlements') e
    where e->>'key' = 'links.max_per_month' and jsonb_typeof(e->'value') = 'number'), 'null'::jsonb),
  'la cuota gratuita coincide con el contexto anterior');
select is((select team_id from public.get_default_team_access('stats.view')),
  current_setting('test.narrow_team')::uuid, 'se devuelve el equipo propio');
select is((select permitted from public.get_default_team_access('stats.view')),
  public.has_team_permission(current_setting('test.narrow_team')::uuid, 'stats.view'),
  'el permiso de estadísticas coincide con el RPC existente');
select ok((select permitted from public.get_default_team_access('stats.view')),
  'el propietario activo puede ver estadísticas');
select ok(not (select permitted from public.get_default_team_access('not.a.permission')),
  'un permiso inexistente es denegado');
reset role;

update public.team_members set status = 'suspended'
where team_id = current_setting('test.narrow_team')::uuid and user_id = auth.uid();
set local role authenticated;
select ok(not (select permitted from public.get_default_team_access('stats.view')),
  'la suspensión revoca el permiso');
reset role;

update public.team_members set status = 'active',
  role_id = (select id from public.roles where key = 'team_viewer')
where team_id = current_setting('test.narrow_team')::uuid and user_id = auth.uid();
set local role authenticated;
select is((select permitted from public.get_default_team_access('stats.view')),
  public.has_team_permission(current_setting('test.narrow_team')::uuid, 'stats.view'),
  'el permiso de un rol distinto coincide con el RPC existente');
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d2', true);
set local role authenticated;
select is((select team_id from public.get_default_team_access('stats.view')), null::uuid,
  'otro usuario no ve el equipo ajeno');
select ok(not (select permitted from public.get_default_team_access('stats.view')),
  'sin equipo se deniega el permiso');
reset role;

insert into public.subscriptions(user_id, service_id, status, start_date)
select '00000000-0000-0000-0000-0000000000d1', id, 'ACTIVE', now()
from public.services where plan_key = 'pro' and active = true limit 1;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', true);
set local role authenticated;
select is(public.get_link_creation_access()->>'plan_key', 'pro', 'se usa el plan de pago efectivo');
select is(public.get_link_creation_access()->'plan_key', public.get_access_context()->'plan_key',
  'el plan de pago coincide con el contexto anterior');
select is(public.get_link_creation_access()->'monthly_limit',
  coalesce((select e->'value' from jsonb_array_elements(public.get_access_context()->'entitlements') e
    where e->>'key' = 'links.max_per_month' and jsonb_typeof(e->'value') = 'number'), 'null'::jsonb),
  'la cuota de pago coincide con el contexto anterior');
reset role;
select set_config('request.jwt.claim.sub', '', true);
select throws_ok($$select * from public.get_default_team_access('stats.view')$$,
  '42501', 'AUTHENTICATION_REQUIRED', 'consultar equipo exige identidad');

select * from finish();
rollback;
