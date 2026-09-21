export interface SubscriptionContext {
    id: string;
    serviceId: string;
    status: string | null;
    startDate: string | null;
    endDate: string | null;
}

export type TeamAccess = {
    teamId: string;
    role: string;
    permissions: Set<string>;
};

type AccessContextBase = {
    roles: Set<string>;
    permissions: Set<string>;
    teams: Map<string, TeamAccess>;

    serviceId: string;
    entitlements: Map<string, unknown>;
    /**
     * `plan_key` del servicio efectivo, resuelto desde la suscripción vigente.
     *
     * Es la única fuente de verdad del plan. El JWT también lleva uno
     * (`user_metadata.user_plan`, que el hook de token toma de
     * `users_profiles.plan`), pero nada lo actualiza cuando una suscripción se
     * activa: quien pagaba conservaba las capacidades de su plan anterior hasta
     * que alguien tocaba esa tabla a mano.
     */
    planKey: string | null;
};

export type AccessContextAnonymous = AccessContextBase & {
    userId: null;
    default_team_id: null;
    subscription: null;
    anonymous: true;
};

export type AccessContextAuthenticated = AccessContextBase & {
    userId: string;
    default_team_id: string | null;
    subscription: SubscriptionContext | null;
    anonymous: false;
};

export type AccessContext = AccessContextAnonymous | AccessContextAuthenticated;

export type AccessContextRow = {
    user_id: string | null;
    anonymous: boolean;
    service_id: string;
    default_team_id: string | null;
    subscription: {
        id: string;
        service_id: string;
        status: string | null;
        start_date: string | null;
        end_date: string | null;
    } | null;
    plan_key: string | null;
    roles: Array<string>;
    permissions: Array<string>;
    entitlements: Array<{
        key: string;
        value: unknown;
    }>;
    teams: Array<{
        team_id: string;
        role: string;
        permissions: string[];
    }>;
};
