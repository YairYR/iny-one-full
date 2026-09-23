create policy "roles_select_to_authenticated"
on "public"."roles"
as PERMISSIVE for select
to authenticated
using (true);
