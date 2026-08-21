export interface SubscriptionContext {
    id: string;
    serviceId: string;
    status: string | null;
    startDate: string | null;
    endDate: string | null;
}

export interface AccessContext {
    userId: string;
    roles: Set<string>;
    permissions: Set<string>;
    serviceId: string;
    subscription: SubscriptionContext | null;
    entitlements: Map<string, unknown>;
}
