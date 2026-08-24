export const PERMISSIONS = {
    LINKS_CREATE: "links.create",
    LINKS_READ: "links.read",
    LINKS_UPDATE: "links.update",
    LINKS_DELETE: "links.delete",
    LINKS_TRANSFER: "links.transfer",

    STATS_VIEW: "stats.view",
    STATS_EXPORT: "stats.export",
    STATS_VIEW_SENSITIVE: "stats.view_sensitive",

    DOMAINS_ADD: "domains.add",
    DOMAINS_DELETE: "domains.delete",
    DOMAINS_VERIFY: "domains.verify",
    DOMAINS_READ: "domains.read",

    TEAM_READ: "team.read",
    TEAM_INVITE: "team.invite",
    TEAM_REMOVE: "team.remove",
    TEAM_MANAGE_ROLES: "team.manage_roles",

    ADMIN_READ: "admin.read",
    ADMIN_MANAGE_USERS: "admin.manage_users",
    ADMIN_MANAGE_PERMISSIONS: "admin.manage_permissions",
    ADMIN_MANAGE_PLANS: "admin.manage_plans",
    ADMIN_MANAGE_BILLING: "admin.manage_billing",
    ADMIN_ACCESS_AUDIT_LOG: "admin.access_audit_log",

    SECURITY_BLACKLIST_DOMAINS: "security.blacklist_domains",
    SECURITY_WHITELIST_DOMAINS: "security.whitelist_domains",
    SECURITY_VIEW_PROTECTED: "security.view_protected",
    SECURITY_CHANGE_RATELIMITS: "security.change_ratelimits",

    SYSTEM_VIEW_HEALTH: "system.view_health",
    SYSTEM_RESTART_WORKERS: "system.restart_workers",
    SYSTEM_MANAGE_KEYS: "system.manage_keys",
} as const;

export type Permission =
    (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
