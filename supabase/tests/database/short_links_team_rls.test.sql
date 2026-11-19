begin;
set local request.jwt.claims = '{}';
select no_plan();

select ok(has_schema_privilege('authenticated', 'team_rls_private', 'USAGE'),
  'authenticated puede usar el esquema de la política');
select ok(not has_schema_privilege('anon', 'team_rls_private', 'USAGE'),
  'anon no puede usar el esquema interno');
select ok(has_function_privilege('authenticated', 'team_rls_private.authorized_team_ids(text)', 'EXECUTE'),
  'authenticated puede evaluar la función de la política');
select ok(not has_function_privilege('anon', 'team_rls_private.authorized_team_ids(text)', 'EXECUTE'),
  'anon no puede ejecutar la función interna');
select ok(not has_function_privilege('service_role', 'team_rls_private.authorized_team_ids(text)', 'EXECUTE'),
  'service_role no puede ejecutar la función interna');
select ok(has_function_privilege('authenticated', 'public.has_team_permission(uuid,text)', 'EXECUTE'),
  'el RPC anterior sigue disponible');

do $block$
declare owner_id uuid := gen_random_uuid(); viewer_id uuid := gen_random_uuid();
  other_id uuid := gen_random_uuid(); owner_team uuid; other_team uuid;
  own_link uuid; other_link uuid; null_link uuid;
  prefix text := substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
begin
  insert into auth.users(id, email) values
    (owner_id, 'test-' || owner_id::text || '@example.invalid'),
    (viewer_id, 'test-' || viewer_id::text || '@example.invalid'),
    (other_id, 'test-' || other_id::text || '@example.invalid');
  perform set_config('request.jwt.claim.sub', owner_id::text, true);
  perform public.ensure_personal_team();
  perform set_config('request.jwt.claim.sub', other_id::text, true);
  perform public.ensure_personal_team();
  select default_team_id into strict owner_team from public.users_profiles where id = owner_id;
  select default_team_id into strict other_team from public.users_profiles where id = other_id;
  insert into public.team_members(team_id, user_id, role_id, status)
  select owner_team, viewer_id, id, 'active' from public.roles where key = 'team_viewer';
  if not found then raise exception 'Falta el rol team_viewer'; end if;

  insert into public.short_links(slug, destination, team_id, created_by)
  values ('tr_' || prefix || '_own', 'https://example.invalid/', owner_team, owner_id)
  returning link_id into own_link;
  insert into public.short_links(slug, destination, team_id, created_by)
  values ('tr_' || prefix || '_other', 'https://example.invalid/', other_team, other_id)
  returning link_id into other_link;
  insert into public.short_links(slug, destination, team_id, created_by)
  values ('tr_' || prefix || '_null', 'https://example.invalid/', null, owner_id)
  returning link_id into null_link;

  perform set_config('test_rls.owner', owner_id::text, true);
  perform set_config('test_rls.viewer', viewer_id::text, true);
  perform set_config('test_rls.other', other_id::text, true);
  perform set_config('test_rls.team', owner_team::text, true);
  perform set_config('test_rls.other_team', other_team::text, true);
  perform set_config('test_rls.own_link', own_link::text, true);
  perform set_config('test_rls.other_link', other_link::text, true);
  perform set_config('test_rls.null_link', null_link::text, true);
end
$block$;

set local role authenticated;
do $block$ begin
  perform set_config('request.jwt.claim.sub', current_setting('test_rls.owner'), true);
end $block$;
select is((select count(*) from public.short_links
  where link_id = current_setting('test_rls.own_link')::uuid), 1::bigint,
  'owner puede leer el enlace de su equipo');
select is((select count(*) from public.short_links
  where link_id = current_setting('test_rls.other_link')::uuid), 0::bigint,
  'owner no puede leer enlaces de otro equipo');
select is((select count(*) from public.short_links
  where link_id = current_setting('test_rls.null_link')::uuid), 0::bigint,
  'un enlace sin equipo sigue siendo invisible');
with changed as (
  update public.short_links set name = 'test'
  where link_id = current_setting('test_rls.own_link')::uuid returning 1
) select is(count(*), 1::bigint, 'owner puede actualizar su enlace') from changed;
select throws_ok(
  $$update public.short_links set team_id = current_setting('test_rls.other_team')::uuid
    where link_id = current_setting('test_rls.own_link')::uuid$$,
  '42501', null, 'WITH CHECK impide moverlo a un equipo sin permiso'
);
with deleted as (
  delete from public.short_links where link_id = current_setting('test_rls.own_link')::uuid returning 1
) select is(count(*), 0::bigint, 'sin política DELETE no se borra el enlace') from deleted;
select throws_ok(
  $$insert into public.short_links(slug, destination, team_id)
    values ('test-rls-insert', 'https://example.invalid/', current_setting('test_rls.team')::uuid)$$,
  '42501', null, 'sin política INSERT no se crea el enlace directamente'
);

do $block$ begin
  perform set_config('request.jwt.claim.sub', current_setting('test_rls.viewer'), true);
end $block$;
select is((select count(*) from public.short_links
  where link_id = current_setting('test_rls.own_link')::uuid), 1::bigint,
  'viewer puede leer el enlace');
with changed as (
  update public.short_links set name = 'viewer'
  where link_id = current_setting('test_rls.own_link')::uuid returning 1
) select is(count(*), 0::bigint, 'viewer no puede actualizar el enlace') from changed;
select is(
  current_setting('test_rls.team')::uuid in (
    select team_rls_private.authorized_team_ids('links.read')
  ),
  public.has_team_permission(current_setting('test_rls.team')::uuid, 'links.read'),
  'el conjunto coincide con el RPC para lectura'
);
select is(
  current_setting('test_rls.team')::uuid in (
    select team_rls_private.authorized_team_ids('links.update')
  ),
  public.has_team_permission(current_setting('test_rls.team')::uuid, 'links.update'),
  'el conjunto coincide con el RPC para escritura'
);

reset role;
update public.team_members set status = 'suspended'
where team_id = current_setting('test_rls.team')::uuid
  and user_id = current_setting('test_rls.viewer')::uuid;
set local role authenticated;
select is((select count(*) from public.short_links
  where link_id = current_setting('test_rls.own_link')::uuid), 0::bigint,
  'la suspensión revoca la lectura en la siguiente sentencia');
reset role;
update public.team_members
set status = 'active', role_id = (select id from public.roles where key = 'team_member')
where team_id = current_setting('test_rls.team')::uuid
  and user_id = current_setting('test_rls.viewer')::uuid;
set local role authenticated;
with changed as (
  update public.short_links set name = 'member'
  where link_id = current_setting('test_rls.own_link')::uuid returning 1
) select is(count(*), 1::bigint,
  'un cambio de rol aplica los permisos nuevos en la siguiente sentencia') from changed;
do $block$ begin
  perform set_config('request.jwt.claim.sub', '', true);
end $block$;
select is((select count(*) from public.short_links
  where link_id = current_setting('test_rls.own_link')::uuid), 0::bigint,
  'authenticated sin identidad no tiene acceso');
reset role;

set local role service_role;
select is((select count(*) from public.short_links
  where link_id = current_setting('test_rls.own_link')::uuid), 1::bigint,
  'service_role conserva su comportamiento sin RLS');
reset role;

select * from finish();
rollback;
