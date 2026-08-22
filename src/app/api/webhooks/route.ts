import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from "@/app/api/webhooks/utils";
import { WebhookEventPaypal } from "@/lib/types";
import * as z from 'zod';
import { processPaypalWebhook } from "@/features/payments/services/webhook";

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

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body: WebhookEventPaypal = JSON.parse(rawBody);
    const data = PaypalWebhookBody.parse(body);
    const headers = req.headers;

    console.log('📬 Webhook recibido');
    console.log('Headers:', Object.fromEntries(headers.entries()));
    console.log('Body:', JSON.stringify(data, null, 2));

    const isSignatureValid = await verifySignature(rawBody, headers);

    if (isSignatureValid) {
      console.log('✅ Firma válida. Procesando evento...');
      await processPaypalWebhook(data);

      return NextResponse.json({ ok: true });
    } else {
      console.warn(`❌ Firma NO válida para evento ${data?.id}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } catch (err) {
    console.error('⚠️ Error en webhook PayPal:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
