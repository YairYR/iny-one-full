INSERT INTO public.roles (id, key, name, description, scope)
VALUES
    ('c1d2e3f4-a5b6-7890-1234-56789abcdef3', 'team_owner', 'Team Owner', 'Full access to manage team settings and members.', 'team'),
    ('f1e2d3c4-b5a6-7890-1234-56789abcdef0', 'team_admin', 'Team Admin', 'High privileges to manage team settings and members.', 'team'),
    ('a1b2c3d4-e5f6-7890-1234-56789abcdef1', 'team_member', 'Team Member', 'Limited access to team resources and settings.', 'team'),
    ('b1c2d3e4-f5a6-7890-1234-56789abcdef2', 'team_viewer', 'Team Viewer', 'Read-only access to team resources.', 'team');

INSERT INTO public.permissions (key, description, scope)
VALUES
    ('team.create', 'Allows the user to create a new team.', 'team');

UPDATE public.permissions SET key = 'team.members.invite' WHERE key = 'team.invite';
UPDATE public.permissions SET key = 'team.members.remove' WHERE key = 'team.remove';
UPDATE public.permissions SET key = 'team.members.manage', description = 'Allows to manage team members.' WHERE key = 'team.manage_role';

UPDATE public.permissions
    SET scope = 'team'
WHERE key IN (
    'team.create',
    'team.read',
    'team.update',
    'team.delete',
    'team.members.manage',
    'team.members.invite',
    'team.members.remove',

    'links.create',
    'links.read',
    'links.update',
    'links.delete',
    'stats.view',
    'stats.export',
    'stats.view_sensitive',
    'domains.add',
    'domains.delete',
    'domains.verify',
    'domains.read'
);
