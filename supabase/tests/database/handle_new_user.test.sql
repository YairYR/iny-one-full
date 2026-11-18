begin;
select plan(10);

select hasnt_function('public', 'handle_new_user', 'ya no existe en public (no se expone por RPC)');
select has_function('security', 'handle_new_user', 'existe en security');

select ok(
  not has_function_privilege('anon', 'security.handle_new_user()', 'EXECUTE'),
  'anon no puede ejecutarla'
);
select ok(
  not has_function_privilege('authenticated', 'security.handle_new_user()', 'EXECUTE'),
  'authenticated no puede ejecutarla'
);
select ok(
  has_function_privilege('service_role', 'security.handle_new_user()', 'EXECUTE'),
  'service_role puede ejecutarla'
);
select ok(
  has_function_privilege('supabase_auth_admin', 'security.handle_new_user()', 'EXECUTE'),
  'supabase_auth_admin puede ejecutarla'
);

select ok(
  exists (
    select 1
    from pg_trigger t
    where t.tgname = 'trg_on_user_created'
      and t.tgrelid = 'auth.users'::regclass
      and t.tgfoid = 'security.handle_new_user()'::regprocedure
  ),
  'trg_on_user_created en auth.users apunta a security.handle_new_user'
);

insert into auth.users (id, email)
values ('00000000-0000-0000-0000-0000000000a1', 'handle-new-user@test.local');

select is(
  (select count(*)::int from public.teams where created_by = '00000000-0000-0000-0000-0000000000a1' and name = 'Personal'),
  1,
  'crea el equipo personal'
);

select is(
  (select r.key
     from public.team_members tm
     join public.roles r on r.id = tm.role_id
     join public.teams t on t.id = tm.team_id
    where tm.user_id = '00000000-0000-0000-0000-0000000000a1'
      and t.created_by = tm.user_id),
  'team_owner',
  'agrega al usuario como team_owner de su equipo'
);

select is(
  (select up.default_team_id
     from public.users_profiles up
    where up.id = '00000000-0000-0000-0000-0000000000a1'),
  (select t.id from public.teams t where t.created_by = '00000000-0000-0000-0000-0000000000a1'),
  'crea el perfil con el equipo personal como default_team_id'
);

select * from finish();
rollback;
