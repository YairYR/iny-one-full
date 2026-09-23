create policy "subscriptions_select_own"
on "public"."subscriptions"
to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));
create policy "subscription_requests_select_own"
on "public"."subscription_requests"
to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));
create policy "user_roles_select_own"
on "public"."user_roles"
to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));
create policy "users_profiles_select_own"
on "public"."users_profiles"
to authenticated
using ((id = ( SELECT auth.uid() AS uid)));
create policy "permissions_select_to_authenticated"
on "public"."permissions"
to authenticated
using (true);
create policy "role_permissions_select_to_authenticated"
on "public"."role_permissions"
to authenticated
using (true);
create policy "service_entitlements_select_to_authenticated"
on "public"."service_entitlements"
to authenticated
using (true);
