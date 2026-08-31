import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from "@/app/api/webhooks/utils";
import { PaypalEventType, WebhookEventPaypal } from "@/lib/types";
import * as z from 'zod';
import { processPaypalWebhook } from "@/features/payments/services/webhook";
import { withErrorHandling } from "@/lib/api/http";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";

const PaypalWebhookBody = z.object({
  id: z.string(),
  create_time: z.string(),
  resource_type: z.string(),
  event_type: z.enum(Object.values(PaypalEventType)),
  event_version: z.string(),
  summary: z.string(),
  resource: z.any(),
  links: z.object({
    href: z.string(),
    rel: z.string(),
    method: z.string().optional(),
  }).array(),
});

const log = logger.child({ route: 'api/webhooks' });

export const POST = withErrorHandling(async (request: NextRequest) => {
  const rawBody = await request.text();
  const bodyNoValidated = JSON.parse(rawBody);
  const body = PaypalWebhookBody.safeParse(bodyNoValidated);
  if (body.error || !body.success) {
    log.warn('❌ Webhook inválido:', { error: body.error });
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }

  const headerList = await headers();
  const data: WebhookEventPaypal = body.data;

  log.info('📬 Webhook recibido', {
    headers: Object.fromEntries(headerList.entries()),
    body: data
  });

  // TODO: solo para probar
  const isSignatureValid = true; //await verifySignature(rawBody, headerList);

  if (isSignatureValid) {
    log.info('✅ Firma válida. Procesando evento...');
    await processPaypalWebhook(data);

    return NextResponse.json({ ok: true });
  } else {
    log.warn(`❌ Firma NO válida para evento ${data?.id}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
});
