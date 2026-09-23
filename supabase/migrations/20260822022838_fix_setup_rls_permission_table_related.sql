DROP POLICY "subscriptions_select_own" ON "public"."subscriptions";
DROP POLICY "subscription_requests_select_own" ON "public"."subscription_requests";
DROP POLICY "user_roles_select_own" ON "public"."user_roles";
DROP POLICY "users_profiles_select_own" ON "public"."users_profiles";
DROP POLICY "permissions_select_to_authenticated" ON "public"."permissions";
DROP POLICY "role_permissions_select_to_authenticated" ON "public"."role_permissions";
DROP POLICY "service_entitlements_select_to_authenticated" ON "public"."service_entitlements";
create policy "subscriptions_select_own"
on "public"."subscriptions"
as PERMISSIVE for select
to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));
create policy "subscription_requests_select_own"
on "public"."subscription_requests"
as PERMISSIVE for select
to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));
create policy "user_roles_select_own"
on "public"."user_roles"
as PERMISSIVE for select
to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));
create policy "users_profiles_select_own"
on "public"."users_profiles"
as PERMISSIVE for select
to authenticated
using ((id = ( SELECT auth.uid() AS uid)));
create policy "permissions_select_to_authenticated"
on "public"."permissions"
as PERMISSIVE for select
to authenticated
using (true);
create policy "role_permissions_select_to_authenticated"
on "public"."role_permissions"
as PERMISSIVE for select
to authenticated
using (true);
create policy "service_entitlements_select_to_authenticated"
on "public"."service_entitlements"
as PERMISSIVE for select
to authenticated
using (true);
