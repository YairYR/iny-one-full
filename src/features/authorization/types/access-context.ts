export interface SubscriptionContext {
    id: string;
    serviceId: string;
    status: string | null;
    startDate: string | null;
    endDate: string | null;
}

type AccessContextBase = {
    roles: Set<string>;
    permissions: Set<string>;
    serviceId: string;
    subscription: SubscriptionContext | null;
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
}

export type AccessContextAnonymous = AccessContextBase & {
    anonymous: true;
}

export type AccessContextAuthenticated = AccessContextBase & {
    userId: string;
    anonymous: false;
};

export type AccessContext = AccessContextAnonymous | AccessContextAuthenticated;
