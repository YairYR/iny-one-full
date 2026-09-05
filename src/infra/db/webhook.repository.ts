import { type DbInstance } from "@/infra/db/supabase_service";
import { WebhookEvent } from "@/lib/entities";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function getWebhookRepository(db: DbInstance) {
  return {
    async create(webhook: Omit<WebhookEvent, 'id' | 'created_at'>) {
      return db
        .from('webhook_events')
        .insert(webhook)
        .select();
    },

    async setProcessed(id: string) {
      const now = dayjs.utc().toISOString();
      return db
        .from('webhook_events')
        .update({ processed_at: now })
        .eq('id', id);
    }
  }
}