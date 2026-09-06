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
}

export type AccessContextAnonymous = AccessContextBase & {
    anonymous: true;
}

export type AccessContextAuthenticated = AccessContextBase & {
    userId: string;
    anonymous: false;
};

export type AccessContext = AccessContextAnonymous | AccessContextAuthenticated;
