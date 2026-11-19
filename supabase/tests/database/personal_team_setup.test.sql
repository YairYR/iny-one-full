begin;
select no_plan();
select set_config('request.jwt.claims', '{}', true);

insert into auth.users(id, email) values
  ('00000000-0000-0000-0000-0000000000b1', 'team-setup-1@test.invalid'),
  ('00000000-0000-0000-0000-0000000000b2', 'team-setup-2@test.invalid'),
  ('00000000-0000-0000-0000-0000000000b3', 'team-setup-3@test.invalid'),
  ('00000000-0000-0000-0000-0000000000b4', 'team-setup-4@test.invalid');

select is((select count(*) from public.teams where created_by in (
  '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b2',
  '00000000-0000-0000-0000-0000000000b3')), 0::bigint, 'registro no crea equipos');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', true);
select set_config('test.personal', public.ensure_personal_team('My team')::text, true);
select is((select name from public.teams where id = current_setting('test.personal')::uuid),
  'My team', 'onboarding asigna el nombre');
select is((select team_kind from public.teams where id = current_setting('test.personal')::uuid),
  'personal', 'equipo personal identificable');
select is((select default_team_id from public.users_profiles where id = auth.uid()),
  current_setting('test.personal')::uuid, 'asigna el equipo al perfil');
select is(public.ensure_personal_team(), current_setting('test.personal')::uuid,
  'una segunda ejecución reutiliza el equipo');
select throws_ok(
  $$insert into public.teams (name, created_by, team_kind)
    values ('duplicate', '00000000-0000-0000-0000-0000000000b1', 'personal')$$,
  '23505', null, 'el índice impide un segundo equipo personal');

insert into public.teams(id, name, created_by, created_at) values
  ('00000000-0000-0000-0000-0000000000c1', 'Personal',
   '00000000-0000-0000-0000-0000000000b2', '2020-01-01'),
  ('00000000-0000-0000-0000-0000000000c2', 'Personal',
   '00000000-0000-0000-0000-0000000000b2', '2021-01-01');
insert into public.team_members(team_id, user_id, role_id)
select t.id, t.created_by, r.id from public.teams t cross join public.roles r
where t.id in ('00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000000c2')
  and r.key = 'team_owner';

select security.repair_profiles();
select security.repair_profiles();
select is((select count(*) from public.teams where created_by = '00000000-0000-0000-0000-0000000000b2'),
  2::bigint, 'la reparación repetida no crea equipos');
select is((select default_team_id from public.users_profiles where id = '00000000-0000-0000-0000-0000000000b2'),
  null::uuid, 'la reparación no selecciona equipos ambiguos');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b2', true);
select is(public.ensure_personal_team(), '00000000-0000-0000-0000-0000000000c1'::uuid,
  'reutiliza el equipo personal histórico más antiguo');
select is((select team_kind from public.teams where id = '00000000-0000-0000-0000-0000000000c2'),
  'unclassified', 'conserva el otro equipo sin clasificar');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b3', true);
select set_config('test.fallback', public.ensure_personal_team()::text, true);
select is((select name from public.teams where id = current_setting('test.fallback')::uuid),
  'Personal', 'crea un equipo predeterminado al omitir la configuración');
select throws_ok($$select public.ensure_personal_team('  ')$$,
  '22023', 'INVALID_TEAM_NAME', 'rechaza un nombre vacío');

delete from public.users_profiles where id = '00000000-0000-0000-0000-0000000000b3';
select security.repair_profiles();
select is((select default_team_id from public.users_profiles where id = '00000000-0000-0000-0000-0000000000b3'),
  current_setting('test.fallback')::uuid, 'restaura el perfil y reutiliza su equipo personal');
select is((select count(*) from public.teams where created_by = '00000000-0000-0000-0000-0000000000b3'),
  1::bigint, 'restaurar el perfil no crea otro equipo');

insert into public.teams(id, name, created_by)
values ('00000000-0000-0000-0000-0000000000c4', 'Personal',
  '00000000-0000-0000-0000-0000000000b4');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b4', true);
select throws_ok($$select public.ensure_personal_team()$$,
  '42501', 'PERSONAL_TEAM_MEMBERSHIP_INVALID', 'no crea otro equipo si existe uno histórico sin membresía válida');
select set_config('request.jwt.claim.sub', '', true);
select throws_ok($$select public.ensure_personal_team()$$,
  '42501', 'AUTHENTICATION_REQUIRED', 'rechaza peticiones sin sesión');
select ok(not has_function_privilege('anon', 'public.ensure_personal_team(text)', 'execute'),
  'anon no puede ejecutar el RPC');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', true);
select is(public.complete_personal_setup('Jane team', ' Jane Doe ', 'US', 'America/New_York'),
  current_setting('test.personal')::uuid, 'configura el perfil y reutiliza el equipo');
select is((select full_name from public.users_profiles where id = auth.uid()), 'Jane Doe', 'guarda nombre completo');
select is((select country from public.users_profiles where id = auth.uid()), 'US', 'guarda código de país');
select is((select timezone from public.users_profiles where id = auth.uid()), 'America/New_York', 'guarda zona horaria');
select is(public.get_personal_setup()->>'team_name', 'Jane team', 'recupera el nombre guardado');
select is(public.get_personal_setup()->>'full_name', 'Jane Doe', 'recupera el perfil guardado');
select throws_ok($$select public.complete_personal_setup('Changed', 'Jane', 'US', 'Mars/Olympus')$$,
  '22023', 'INVALID_TIMEZONE', 'rechaza zona horaria inválida');
select is((select name from public.teams where id = current_setting('test.personal')::uuid),
  'Jane team', 'el error de validación no cambia el equipo');
select ok(not has_function_privilege('anon', 'public.complete_personal_setup(text,text,text,text)', 'execute'),
  'anon no puede configurar perfiles');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b3', true);
select is(public.get_personal_setup()->>'full_name', null::text, 'no expone el perfil de otro usuario');
select set_config('request.jwt.claim.sub', '', true);
select throws_ok($$select public.get_personal_setup()$$,
  '42501', 'AUTHENTICATION_REQUIRED', 'consultar configuración requiere sesión');
select throws_ok($$select public.complete_personal_setup('Team', 'Name', null, null)$$,
  '42501', 'AUTHENTICATION_REQUIRED', 'configurar perfil requiere sesión');

select * from finish();
rollback;
