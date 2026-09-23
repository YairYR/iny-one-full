create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
as $$
  declare
claims jsonb;
    user_role public.app_role[];
    user_plan public.app_plan;
    user_timezone text;
begin

user_role := (select role from public.user_roles where id = (event->>'user_id')::uuid);
select plan, timezone into user_plan, user_timezone from public.users_profiles where id = (event->>'user_id')::uuid;

claims := event->'claims';

    if jsonb_typeof(claims->'app_metadata') is null then
      claims := jsonb_set(claims, '{app_metadata}', '{}');
end if;

    if jsonb_typeof(claims->'user_metadata') is null then
      claims := jsonb_set(claims, '{user_metadata}', '{}');
end if;

    if user_role is not null then
      claims := jsonb_set(claims, '{user_metadata, user_role}', to_jsonb(user_role));
else
      claims := jsonb_set(claims, '{user_metadata, user_role}', 'null');
end if;

    if user_plan is not null then
      claims := jsonb_set(claims, '{user_metadata, user_plan}', to_jsonb(user_plan));
else
      claims := jsonb_set(claims, '{user_metadata, user_plan}', 'null');
end if;

    if user_timezone is not null then
      claims := jsonb_set(claims, '{user_metadata, user_timezone}', to_jsonb(user_timezone));
else
      claims := jsonb_set(claims, '{user_metadata, user_timezone}', 'null');
end if;

    event := jsonb_set(event, '{claims}', claims);
return event;
end;
$$;
grant execute
    on function public.custom_access_token_hook
    to supabase_auth_admin;
revoke execute
    on function public.custom_access_token_hook
    from authenticated, anon, public;
grant usage on schema public to supabase_auth_admin;
