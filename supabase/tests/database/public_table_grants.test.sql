begin;
select plan(8);

select ok(
  not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    cross join (values ('anon'), ('authenticated')) as roles(name)
    cross join (values ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')) as privileges(name)
    where n.nspname = 'public'
      and c.relkind in ('r', 'p', 'v', 'm', 'f')
      and has_table_privilege(roles.name, c.oid, privileges.name)
  ),
  'anon y authenticated no tienen TRUNCATE, REFERENCES ni TRIGGER en public'
);

select ok(
  not exists (
    select 1
    from unnest(array[
      'public.audit_logs', 'public.orders', 'public.payments', 'public.discounts',
      'public.services', 'public.short_links_daily_stats', 'public.users_profiles'
    ]) as tables(name)
    cross join (values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE')) as privileges(name)
    where has_table_privilege('anon', tables.name, privileges.name)
  ),
  'anon no tiene acceso a las siete tablas protegidas'
);

select ok(
  not exists (
    select 1
    from unnest(array[
      'public.audit_logs', 'public.orders', 'public.payments', 'public.discounts',
      'public.services', 'public.short_links_daily_stats'
    ]) as tables(name)
    cross join (values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE')) as privileges(name)
    where has_table_privilege('authenticated', tables.name, privileges.name)
  ),
  'authenticated no tiene acceso a las seis tablas internas'
);

select ok(
  has_table_privilege('authenticated', 'public.users_profiles', 'SELECT')
  and not has_table_privilege('authenticated', 'public.users_profiles', 'INSERT')
  and not has_table_privilege('authenticated', 'public.users_profiles', 'UPDATE')
  and not has_table_privilege('authenticated', 'public.users_profiles', 'DELETE'),
  'authenticated conserva solo SELECT en users_profiles'
);

select ok(
  has_table_privilege('authenticated', 'public.short_links', 'SELECT')
  and has_table_privilege('authenticated', 'public.short_links', 'UPDATE'),
  'authenticated conserva SELECT y UPDATE en short_links'
);

select ok(
  not exists (
    select 1
    from unnest(array[
      'public.audit_logs', 'public.orders', 'public.payments', 'public.discounts',
      'public.services', 'public.short_links_daily_stats', 'public.users_profiles'
    ]) as tables(name)
    cross join (values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE')) as privileges(name)
    where not has_table_privilege('service_role', tables.name, privileges.name)
  ),
  'service_role conserva acceso a las siete tablas'
);

-- Supabase ejecuta las migraciones y este test con postgres.
select is(current_user::text, 'postgres', 'la tabla de prueba usa los defaults de postgres');
create table public.test_public_default_privileges (id integer);

select ok(
  not exists (
    select 1
    from (values ('anon'), ('authenticated')) as roles(name)
    cross join (values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'),
                       ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')) as privileges(name)
    where has_table_privilege(roles.name, 'public.test_public_default_privileges', privileges.name)
  ),
  'una tabla nueva de postgres no concede privilegios a anon ni authenticated'
);

select * from finish();
rollback;
