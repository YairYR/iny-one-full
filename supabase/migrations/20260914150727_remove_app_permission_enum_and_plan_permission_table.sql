DROP FUNCTION IF EXISTS public.authorize(app_permission);

CREATE OR REPLACE FUNCTION public.authorize(requested_permission text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
bind_permissions int;
  user_role public.app_role;
begin
  -- Fetch user role once and store it to reduce number of calls
select (auth.jwt() ->> 'user_role')::public.app_role into user_role;

select count(*)
into bind_permissions
from public.role_permissions
where role_permissions.permission = requested_permission
  and role_permissions.role = user_role;

return bind_permissions > 0;
end;
$function$;

drop table if exists plan_permission;
drop type if exists app_permission;
