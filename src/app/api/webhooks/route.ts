import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from "@/app/api/webhooks/utils";
import { WebhookEventPaypal } from "@/lib/types";
import * as z from 'zod';
import { processPaypalWebhook } from "@/features/payments/services/webhook";
import { logger } from "@/lib/logger";

const log = logger.child({ route: 'api/webhooks' });

const PaypalWebhookBody = z.object({
  id: z.string(),
  create_time: z.string(),
  resource_type: z.string(),
  event_type: z.string(),
  event_version: z.string(),
  summary: z.string(),
  resource: z.any(),
  links: z.object({
    href: z.string(),
    rel: z.string(),
    method: z.string().optional(),
  }).array(),
});

/**
 * No se vuelca ni el cuerpo ni las cabeceras del webhook.
 *
 * El cuerpo de PayPal lleva nombre, correo y país del pagador, y el mensaje
 * firmado incluye `WEBHOOK_ID`, que es un secreto. Se registra sólo lo que
 * sirve para diagnosticar: identificador del evento y tipo.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const data = PaypalWebhookBody.parse(JSON.parse(rawBody) as WebhookEventPaypal);

    const isSignatureValid = await verifySignature(rawBody, req.headers);

    if (!isSignatureValid) {
      log.warn('webhook rejected: invalid signature', { event_id: data.id, event_type: data.event_type });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    log.info('webhook accepted', { event_id: data.id, event_type: data.event_type });
    await processPaypalWebhook(data);

    return NextResponse.json({ ok: true });
  } catch (err) {
    log.error('webhook processing failed', { error: err });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
