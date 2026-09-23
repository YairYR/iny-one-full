drop table if exists public.plan_permissions cascade;
drop table if exists public.role_permissions cascade;
drop table if exists public.user_roles cascade;
drop table if exists public.roles cascade;
create table public.permissions (
    id uuid primary key default gen_random_uuid(),
    key text not null unique,
    description text
);
create table public.roles (
    id uuid primary key default gen_random_uuid(),
    key text not null unique,
    name text not null,
    description text
);
create table public.user_roles (
    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    role_id uuid not null
        references public.roles(id)
        on delete cascade,

   primary key (user_id, role_id)
);
create table public.role_permissions (
    role_id uuid not null
        references public.roles(id)
        on delete cascade,

    permission_id uuid not null
        references public.permissions(id)
        on delete cascade,

    primary key (role_id, permission_id)
);
-- ============================================================
-- PERMISSIONS
-- ============================================================

insert into public.permissions (id, key, description)
values
    ('00000000-0000-0000-0000-000000000001', 'links.create', 'Create short links'),
    ('00000000-0000-0000-0000-000000000002', 'links.read', 'View short links'),
    ('00000000-0000-0000-0000-000000000003', 'links.update', 'Update short links'),
    ('00000000-0000-0000-0000-000000000004', 'links.delete', 'Delete short links'),
    ('00000000-0000-0000-0000-000000000005', 'links.transfer', 'Transfer ownership of short links'),

    ('00000000-0000-0000-0000-000000000006', 'stats.view', 'View link statistics'),
    ('00000000-0000-0000-0000-000000000007', 'stats.export', 'Export link statistics'),
    ('00000000-0000-0000-0000-000000000008', 'stats.view_sensitive', 'View sensitive statistics and identifying information'),

    ('00000000-0000-0000-0000-000000000009', 'domains.add', 'Add custom domains'),
    ('00000000-0000-0000-0000-000000000010', 'domains.delete', 'Delete custom domains'),
    ('00000000-0000-0000-0000-000000000011', 'domains.verify', 'Verify custom domain ownership'),
    ('00000000-0000-0000-0000-000000000012', 'domains.read', 'View custom domains'),

    ('00000000-0000-0000-0000-000000000013', 'team.read', 'View team members'),
    ('00000000-0000-0000-0000-000000000014', 'team.invite', 'Invite users to the team'),
    ('00000000-0000-0000-0000-000000000015', 'team.remove', 'Remove users from the team'),
    ('00000000-0000-0000-0000-000000000016', 'team.manage_roles', 'Manage team member roles'),

    ('00000000-0000-0000-0000-000000000017', 'admin.read', 'View administrative information'),
    ('00000000-0000-0000-0000-000000000018', 'admin.manage_users', 'Manage user accounts'),
    ('00000000-0000-0000-0000-000000000019', 'admin.manage_permissions', 'Manage roles and permissions'),
    ('00000000-0000-0000-0000-000000000020', 'admin.manage_plans', 'Manage plans and service offerings'),
    ('00000000-0000-0000-0000-000000000021', 'admin.manage_billing', 'Manage subscriptions and billing'),
    ('00000000-0000-0000-0000-000000000022', 'admin.access_audit_log', 'Access the administrative audit log'),

    ('00000000-0000-0000-0000-000000000023', 'security.blacklist_domains', 'Add domains to the security blacklist'),
    ('00000000-0000-0000-0000-000000000024', 'security.whitelist_domains', 'Add domains to the security whitelist'),
    ('00000000-0000-0000-0000-000000000025', 'security.view_protected', 'View protected security information'),
    ('00000000-0000-0000-0000-000000000026', 'security.change_ratelimits', 'Change security rate limits'),

    ('00000000-0000-0000-0000-000000000027', 'system.view_health', 'View system health information'),
    ('00000000-0000-0000-0000-000000000028', 'system.restart_workers', 'Restart background workers'),
    ('00000000-0000-0000-0000-000000000029', 'system.manage_keys', 'Manage system and API keys')
    on conflict (key) do update
                             set description = excluded.description;
-- ============================================================
-- ROLES
-- ============================================================

insert into public.roles (id, key, name, description)
values
    (
        '10000000-0000-0000-0000-000000000001',
        'user',
        'User',
        'Standard application user with access to personal resources and permitted features'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'support',
        'Support',
        'Support staff with access to operational and diagnostic information required to assist users'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'admin',
        'Administrator',
        'Administrator with full access to application, security, billing, and system management'
    )
    on conflict (key) do update
                             set
                                 name = excluded.name,
                             description = excluded.description;
-- ============================================================
-- ROLE PERMISSIONS
-- ============================================================

-- ------------------------------------------------------------
-- USER
-- ------------------------------------------------------------

insert into public.role_permissions (role_id, permission_id)
select
    '10000000-0000-0000-0000-000000000001'::uuid,
    p.id
from public.permissions p
where p.key in (
                'links.create',
                'links.read',
                'links.update',
                'links.delete',
                'stats.view',
                'stats.export',
                'domains.add',
                'domains.delete',
                'domains.verify',
                'domains.read',
                'team.read',
                'team.invite',
                'team.remove',
                'team.manage_roles'
    )
    on conflict do nothing;
-- ------------------------------------------------------------
-- SUPPORT
-- ------------------------------------------------------------

insert into public.role_permissions (role_id, permission_id)
select
    '10000000-0000-0000-0000-000000000002'::uuid,
    p.id
from public.permissions p
where p.key in (
                'links.read',
                'links.update',
                'links.delete',
                'links.transfer',

                'stats.view',
                'stats.view_sensitive',
                'stats.export',

                'domains.read',
                'domains.verify',

                'team.read',

                'admin.read',
                'admin.access_audit_log',

                'security.view_protected',
                'security.blacklist_domains',
                'security.whitelist_domains',

                'system.view_health'
    )
    on conflict do nothing;
-- ------------------------------------------------------------
-- ADMIN
-- ------------------------------------------------------------

insert into public.role_permissions (role_id, permission_id)
select
    '10000000-0000-0000-0000-000000000003'::uuid,
    p.id
from public.permissions p
    on conflict do nothing;
