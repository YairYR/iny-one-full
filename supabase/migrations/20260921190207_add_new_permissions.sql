ALTER TABLE public.permissions
    ADD COLUMN IF NOT EXISTS name text NULL;

-- ============================================================
-- GLOBAL PERMISSIONS
-- ============================================================

INSERT INTO public.permissions (
    key,
    name,
    description,
    scope
)
VALUES

    (
        'admin.users.read',
        'Read users',
        'View users and their administrative information.',
        'global'
    ),

    (
        'admin.users.update',
        'Update users',
        'Modify user administrative information.',
        'global'
    ),

    (
        'security.audit.read',
        'Read audit logs',
        'View security and administrative audit logs.',
        'global'
    ),

    (
        'security.audit.manage',
        'Manage audit logs',
        'Manage security and administrative audit configuration.',
        'global'
    ),

    (
        'admin.roles.read',
        'Read roles',
        'View global and team roles.',
        'global'
    ),

    (
        'admin.roles.update',
        'Update roles',
        'Create, modify or remove roles.',
        'global'
    ),

    (
        'admin.permissions.read',
        'Read permissions',
        'View available permissions.',
        'global'
    ),

    (
        'admin.permissions.update',
        'Update permissions',
        'Create, modify or remove permissions.',
        'global'
    ),

    (
        'admin.teams.read',
        'Read teams',
        'View teams from the administrative context.',
        'global'
    ),

    (
        'admin.teams.update',
        'Update teams',
        'Manage teams from the administrative context.',
        'global'
    ),

    (
        'admin.subscriptions.read',
        'Read subscriptions',
        'View user subscriptions and subscription information.',
        'global'
    ),

    (
        'admin.subscriptions.update',
        'Update subscriptions',
        'Manage user subscriptions from the administrative context.',
        'global'
    )

    ON CONFLICT (key) DO NOTHING;


-- ============================================================
-- TEAM PERMISSIONS
-- ============================================================

INSERT INTO public.permissions (
    key,
    name,
    description,
    scope
)
VALUES

    (
        'links.create',
        'Create links',
        'Create links within a Team.',
        'team'
    ),

    (
        'links.read',
        'Read links',
        'View links belonging to a Team.',
        'team'
    ),

    (
        'links.update',
        'Update links',
        'Modify links belonging to a Team.',
        'team'
    ),

    (
        'links.delete',
        'Delete links',
        'Delete links belonging to a Team.',
        'team'
    ),

    (
        'stats.read',
        'Read statistics',
        'View statistics for resources belonging to a Team.',
        'team'
    ),

    (
        'domains.create',
        'Create domains',
        'Create domains within a Team.',
        'team'
    ),

    (
        'domains.read',
        'Read domains',
        'View domains belonging to a Team.',
        'team'
    ),

    (
        'domains.update',
        'Update domains',
        'Modify domains belonging to a Team.',
        'team'
    ),

    (
        'domains.delete',
        'Delete domains',
        'Delete domains belonging to a Team.',
        'team'
    ),

    (
        'team.read',
        'Read team',
        'View Team information.',
        'team'
    ),

    (
        'team.update',
        'Update team',
        'Modify Team configuration.',
        'team'
    ),

    (
        'team.members.read',
        'Read team members',
        'View members of a Team.',
        'team'
    ),

    (
        'team.members.invite',
        'Invite team members',
        'Invite users to a Team.',
        'team'
    ),

    (
        'team.members.remove',
        'Remove team members',
        'Remove users from a Team.',
        'team'
    ),

    (
        'team.members.update',
        'Update team members',
        'Change Team member roles or membership properties.',
        'team'
    )

    ON CONFLICT (key) DO NOTHING;


-- ============================================================
-- GLOBAL ROLE: user
-- ============================================================
-- No se asignan permisos globales relacionados con Teams,
-- links, domains, etc.
--
-- El usuario obtiene esos permisos mediante sus Team roles.


-- ============================================================
-- GLOBAL ROLE: support
-- ============================================================

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM public.roles AS r
         CROSS JOIN public.permissions AS p
WHERE r.key = 'support'
  AND r.scope = 'global'
  AND p.key IN (
                'admin.users.read',
                'admin.users.update',
                'security.audit.read',
                'admin.roles.read',
                'admin.permissions.read',
                'admin.teams.read',
                'admin.subscriptions.read'
    )
    ON CONFLICT DO NOTHING;


-- ============================================================
-- GLOBAL ROLE: admin
-- ============================================================

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM public.roles AS r
         CROSS JOIN public.permissions AS p
WHERE r.key = 'admin'
  AND r.scope = 'global'
  AND p.scope = 'global'
    ON CONFLICT DO NOTHING;


-- ============================================================
-- TEAM ROLE: team_viewer
-- ============================================================

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM public.roles AS r
         CROSS JOIN public.permissions AS p
WHERE r.key = 'team_viewer'
  AND r.scope = 'team'
  AND p.key IN (
                'links.read',
                'stats.read',
                'domains.read',
                'team.read'
    )
    ON CONFLICT DO NOTHING;


-- ============================================================
-- TEAM ROLE: team_member
-- ============================================================

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM public.roles AS r
         CROSS JOIN public.permissions AS p
WHERE r.key = 'team_member'
  AND r.scope = 'team'
  AND p.key IN (
                'links.create',
                'links.read',
                'links.update',
                'stats.read',
                'domains.read',
                'team.read'
    )
    ON CONFLICT DO NOTHING;


-- ============================================================
-- TEAM ROLE: team_admin
-- ============================================================

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM public.roles AS r
         CROSS JOIN public.permissions AS p
WHERE r.key = 'team_admin'
  AND r.scope = 'team'
  AND p.scope = 'team'
    ON CONFLICT DO NOTHING;


-- ============================================================
-- TEAM ROLE: team_owner
-- ============================================================

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM public.roles AS r
         CROSS JOIN public.permissions AS p
WHERE r.key = 'team_owner'
  AND r.scope = 'team'
  AND p.scope = 'team'
    ON CONFLICT DO NOTHING;
