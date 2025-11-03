import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
// @ts-expect-error has default export
import crc32 from 'buffer-crc32';
import fs from 'fs/promises';

const CACHE_DIR = process.env.CACHE_DIR || '/tmp'; // usa /tmp en Vercel
const WEBHOOK_ID = process.env.WEBHOOK_ID; // <tu webhook ID de PayPal>

// === Helper: Descargar y cachear certificados ===
async function downloadAndCache(url: string, cacheKey?: string) {
  if (!cacheKey) {
    cacheKey = url.replace(/\W+/g, '-');
  }
  const filePath = `${CACHE_DIR}/${cacheKey}`;

  // 1️⃣ Revisar si ya está cacheado
  const cachedData = await fs.readFile(filePath, 'utf-8').catch(() => null);
  if (cachedData) {
    return cachedData;
  }

  // 2️⃣ Descargar si no está cacheado
  const response = await fetch(url);
  const data = await response.text();

  await fs.writeFile(filePath, data);
  return data;
}

// === Helper: Verificar la firma localmente ===
async function verifySignature(event: string|Buffer, headers: Headers) {
  const transmissionId = headers.get('paypal-transmission-id') as string;
  const timeStamp = headers.get('paypal-transmission-time') as string;
  const certUrl = headers.get('paypal-cert-url') as string;
  const transmissionSig = headers.get('paypal-transmission-sig') as string;

  // Calcular CRC32 del cuerpo raw
  const crc = parseInt('0x' + crc32(event).toString('hex'));

  // Construir mensaje original firmado
  const message = `${transmissionId}|${timeStamp}|${WEBHOOK_ID}|${crc}`;
  console.log('🧩 Original signed message:', message);

  // Descargar certificado y cachearlo
  const certPem = await downloadAndCache(certUrl);

  // Decodificar la firma base64
  const signatureBuffer = Buffer.from(transmissionSig, 'base64');

  // Crear verificador
  const verifier = crypto.createVerify('SHA256');
  verifier.update(message);

  // Verificar firma con el certificado
  return verifier.verify(certPem, signatureBuffer);
}

// === Handler principal del webhook ===
export async function POST(req: NextRequest) {
  try {
    // Leer cuerpo raw (no usar json() porque altera el orden)
    const rawBody = await req.text();
    const data = JSON.parse(rawBody);
    const headers = req.headers;

    console.log('📬 Webhook recibido');
    console.log('Headers:', Object.fromEntries(headers.entries()));
    console.log('Body:', JSON.stringify(data, null, 2));

    // Verificar la firma
    const isSignatureValid = await verifySignature(rawBody, headers);

    if (isSignatureValid) {
      console.log('✅ Firma válida. Procesando evento...');
      // Aquí procesas el evento según el tipo
      // Ejemplo:
      // if (data.event_type === 'PAYMENT.CAPTURE.COMPLETED') { ... }

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
