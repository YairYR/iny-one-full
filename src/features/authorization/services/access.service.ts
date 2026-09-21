import 'server-only';

import { AuthorizationRepository } from "@/infra/db/authorization.repository";
import {
    AccessContext,
    AccessContextRow, TeamAccess
} from "@/features/authorization/types/access-context";

export class AccessService {
    constructor(
        private readonly repository: AuthorizationRepository,
    ) {}

    async resolve(): Promise<AccessContext> {
        const result = await this.repository.getSessionAccessContext() as unknown as AccessContextRow;
        return this.mapAccessContext(result);
    }

    private mapAccessContext(row: AccessContextRow): AccessContext {
        const roles = new Set(row.roles);
        const permissions = new Set(row.permissions);

        const entitlements = new Map(
          row.entitlements.map(
            (entitlement) => [
                entitlement.key,
                entitlement.value,
            ],
          ),
        );

        const teams = new Map<string, TeamAccess>(
          row.teams.map((team) => [
              team.team_id,
              {
                  teamId: team.team_id,
                  role: team.role,
                  permissions: new Set(team.permissions),
              },
          ]),
        );

        const base = {
            roles,
            permissions,
            userId: null,
            default_team_id: null,
            serviceId: row.service_id,
            subscription: null,
            entitlements,
            planKey: row.plan_key,
            teams,
        };

        if (row.anonymous) {
            return Object.freeze({
                ...base,
                anonymous: true,
            });
        }

        if (!row.user_id) {
            throw new Error(
              'Authenticated access context has no user_id',
            );
        }

        return Object.freeze({
            ...base,
            userId: row.user_id,
            default_team_id: row.default_team_id,
            subscription: row.subscription
              ? {
                  id: row.subscription.id,
                  serviceId: row.subscription.service_id,
                  status: row.subscription.status,
                  startDate: row.subscription.start_date,
                  endDate: row.subscription.end_date,
              }
              : null,
            anonymous: false,
        });
    }
}