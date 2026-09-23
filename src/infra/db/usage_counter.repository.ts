import { DbInstance } from "@/infra/db/supabase_service";
import { Metric } from "@/features/authorization/types/metric";

export function getUsageCounterRepository(db: DbInstance) {
  return {
    async getMetric(scope_type: 'user'|'team', scope_id: string, metricKey: Metric, periodStart: Date) {
      return db.from('usage_counters')
        .select('metric, used')
        .eq('scope_type', scope_type)
        .eq('scope_id', scope_id)
        .eq('metric', metricKey)
        .eq('period_start', periodStart.toISOString().split('T')[0])
        .limit(1)
        .maybeSingle();
    },
  }
}