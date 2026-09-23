-- ============================================================
-- FREE_ANONYMOUS
-- service_id: 1fc699f5-ce0f-4ea7-922e-7a0e8b339a5b
-- ============================================================

INSERT INTO public.service_entitlements (service_id, key, value)
VALUES
    ('1fc699f5-ce0f-4ea7-922e-7a0e8b339a5b', 'links.enabled', 'true'),
    ('1fc699f5-ce0f-4ea7-922e-7a0e8b339a5b', 'links.max_per_month', '5'),

    ('1fc699f5-ce0f-4ea7-922e-7a0e8b339a5b', 'stats.enabled', 'false'),
    ('1fc699f5-ce0f-4ea7-922e-7a0e8b339a5b', 'stats.export', 'false'),
    ('1fc699f5-ce0f-4ea7-922e-7a0e8b339a5b', 'stats.sensitive', 'false'),

    ('1fc699f5-ce0f-4ea7-922e-7a0e8b339a5b', 'domains.enabled', 'false'),
    ('1fc699f5-ce0f-4ea7-922e-7a0e8b339a5b', 'domains.max', '0'),

    ('1fc699f5-ce0f-4ea7-922e-7a0e8b339a5b', 'team.enabled', 'false'),
    ('1fc699f5-ce0f-4ea7-922e-7a0e8b339a5b', 'team.members.max', '1');
