import { type DbInstance } from "@/infra/db/supabase_service";
import { WebhookEvent } from "@/core/entities";

export function getWebhookRepository(db: DbInstance) {
  return {
    async create(webhook: Omit<WebhookEvent, 'id' | 'created_at'>) {
      return db
        .from('webhook_events')
        .insert(webhook)
        .select();
    },

    async setProcessed(id: string, processed: boolean) {
      return db
        .from('webhook_events')
        .update({ processed })
        .eq('id', id);
    }
  }
}