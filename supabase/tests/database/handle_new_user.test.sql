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
  0,
  'no crea un equipo durante el registro'
);

select ok(
  exists (select 1 from public.users_profiles where id = '00000000-0000-0000-0000-0000000000a1'),
  'crea el perfil'
);

select is(
  (select default_team_id from public.users_profiles
    where id = '00000000-0000-0000-0000-0000000000a1'),
  null::uuid,
  'el perfil no tiene equipo predeterminado hasta la configuración'
);

select * from finish();
rollback;
