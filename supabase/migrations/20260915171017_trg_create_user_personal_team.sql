CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
v_team_id uuid;
    v_role_id uuid;
begin
select id into v_role_id from public.roles where key = 'team_owner';

-- 1. Crear team personal
insert into public.teams (
    name,
    team_kind,
    created_by
)
values (
           'Personal',
           'personal',
           new.id
       )
    returning id into v_team_id;

-- 2. Agregar usuario como miembro
insert into public.team_members (
    team_id,
    user_id,
    role_id
)
values (
           v_team_id,
           new.id,
           v_role_id
       );

-- 3. Crear otras entidades iniciales
insert into public.users_profiles (
    id,
    plan
)
values (
           new.id,
           'free'
       );

return new;
end;
$function$;

-- TRIGGER

CREATE OR REPLACE TRIGGER trg_on_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
