INSERT INTO "public"."services" ("id", "name", "description", "price", "currency", "type", "interval", "active", "created_at", "service_gateway", "external_service_id", "plan_key") VALUES ('0e8b113b-d8f7-45f8-93fb-192594e4b647', 'Plan Premium', null, '15.00', 'USD', 'subscription', 'month', false, '2025-10-25 22:54:01.937468+00', 'paypal', null, null), ('1fc699f5-ce0f-4ea7-922e-7a0e8b339a5b', 'FREE_ANONYMOUS', 'Default subscription for anonymous users', '0.00', 'USD', 'subscription', null, true, '2026-09-06 21:32:40.065016+00', 'internal', '', null), ('4c08e121-5b17-46cc-9ca7-f5e05f4343a2', 'FREE', 'Default FREE subscription', '0.00', 'USD', 'subscription', null, true, '2026-09-06 20:19:14.084733+00', 'internal', '', 'free'), ('575577e4-abab-4286-bfb9-9e3c809bcb67', 'Plan Pro', null, '10.00', 'USD', 'subscription', 'month', true, '2025-10-25 22:42:55.981232+00', 'paypal', 'P-7UD89181YW591052XND7JXZI', 'pro'), ('62f7de06-6bfc-4438-aa3d-e323e51ea0c4', 'Plan Enterprise', null, '20.00', 'USD', 'subscription', 'month', false, '2025-10-25 22:54:46.430425+00', 'paypal', 'P-0K028639TS294490UND75W7Y', null), ('fa88cc5f-4da5-464d-b571-eb690c7c2a31', 'Plan Starter', null, '5.00', 'USD', 'subscription', 'month', true, '2026-06-28 22:09:00.569408+00', 'paypal', 'P-7NN69076Y1107393ENJAZ6LQ', 'basic');

-- ============================================================
-- FREE
-- service_id: 4c08e121-5b17-46cc-9ca7-f5e05f4343a2
-- ============================================================

INSERT INTO public.service_entitlements (service_id, key, value)
VALUES
    ('4c08e121-5b17-46cc-9ca7-f5e05f4343a2', 'links.enabled', 'true'),
    ('4c08e121-5b17-46cc-9ca7-f5e05f4343a2', 'links.max_per_month', '50'),

    ('4c08e121-5b17-46cc-9ca7-f5e05f4343a2', 'stats.enabled', 'true'),
    ('4c08e121-5b17-46cc-9ca7-f5e05f4343a2', 'stats.export', 'false'),
    ('4c08e121-5b17-46cc-9ca7-f5e05f4343a2', 'stats.sensitive', 'false'),

    ('4c08e121-5b17-46cc-9ca7-f5e05f4343a2', 'domains.enabled', 'false'),
    ('4c08e121-5b17-46cc-9ca7-f5e05f4343a2', 'domains.max', '0'),

    ('4c08e121-5b17-46cc-9ca7-f5e05f4343a2', 'team.enabled', 'false'),
    ('4c08e121-5b17-46cc-9ca7-f5e05f4343a2', 'team.members.max', '1');
-- ============================================================
-- BASIC / STARTER
-- service_id: fa88cc5f-4da5-464d-b571-eb690c7c2a31
-- ============================================================

INSERT INTO public.service_entitlements (service_id, key, value)
VALUES
    ('fa88cc5f-4da5-464d-b571-eb690c7c2a31', 'links.enabled', 'true'),
    ('fa88cc5f-4da5-464d-b571-eb690c7c2a31', 'links.max_per_month', '1000'),

    ('fa88cc5f-4da5-464d-b571-eb690c7c2a31', 'stats.enabled', 'true'),
    ('fa88cc5f-4da5-464d-b571-eb690c7c2a31', 'stats.export', 'true'),
    ('fa88cc5f-4da5-464d-b571-eb690c7c2a31', 'stats.sensitive', 'false'),

    ('fa88cc5f-4da5-464d-b571-eb690c7c2a31', 'domains.enabled', 'true'),
    ('fa88cc5f-4da5-464d-b571-eb690c7c2a31', 'domains.max', '1'),

    ('fa88cc5f-4da5-464d-b571-eb690c7c2a31', 'team.enabled', 'false'),
    ('fa88cc5f-4da5-464d-b571-eb690c7c2a31', 'team.members.max', '1');
-- ============================================================
-- PRO
-- service_id: 575577e4-abab-4286-bfb9-9e3c809bcb67
-- ============================================================

INSERT INTO public.service_entitlements (service_id, key, value)
VALUES
    ('575577e4-abab-4286-bfb9-9e3c809bcb67', 'links.enabled', 'true'),
    ('575577e4-abab-4286-bfb9-9e3c809bcb67', 'links.max_per_month', '10000'),

    ('575577e4-abab-4286-bfb9-9e3c809bcb67', 'stats.enabled', 'true'),
    ('575577e4-abab-4286-bfb9-9e3c809bcb67', 'stats.export', 'true'),
    ('575577e4-abab-4286-bfb9-9e3c809bcb67', 'stats.sensitive', 'true'),

    ('575577e4-abab-4286-bfb9-9e3c809bcb67', 'domains.enabled', 'true'),
    ('575577e4-abab-4286-bfb9-9e3c809bcb67', 'domains.max', '10'),

    ('575577e4-abab-4286-bfb9-9e3c809bcb67', 'team.enabled', 'true'),
    ('575577e4-abab-4286-bfb9-9e3c809bcb67', 'team.members.max', '5');
