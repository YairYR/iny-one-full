import crypto from "node:crypto";
import fs from 'node:fs/promises';
// @ts-expect-error has default export
import crc32 from 'buffer-crc32';
import path from 'node:path';
import { logger } from "@/lib/logger";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

const log = logger.child({ module: 'webhooks/verify' });

/**
 * Directorio de caché del certificado.
 *
 * Tiene que ser una ruta ABSOLUTA a un directorio escribible. En Vercel el
 * sistema de ficheros es de sólo lectura salvo `/tmp`, así que resolverlo
 * contra `process.cwd()` deja la ruta dentro del bundle y el `writeFile` falla.
 */
const CACHE_DIR = path.resolve(process.env.CACHE_DIR || '/tmp');
const WEBHOOK_ID = process.env.WEBHOOK_ID;

/**
 * Dominios de los que se acepta descargar el certificado de firma.
 *
 * Sin esta lista, `verifySignature` descarga el certificado del host que indica
 * la cabecera `paypal-cert-url` de la propia petición entrante: cualquiera
 * puede firmar un evento con su clave, alojar su certificado y hacer que la
 * verificación pase. Es a la vez falsificación de webhooks y SSRF.
 *
 * Se compara el hostname exacto o su sufijo con punto, nunca con `includes`:
 * `paypal.com.atacante.net` contiene la cadena y no es de PayPal.
 */
const ALLOWED_CERT_HOSTS = ['paypal.com', 'sandbox.paypal.com'];

export function isTrustedCertUrl(rawUrl: string): boolean {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:') return false;

  const host = url.hostname.toLowerCase();
  return ALLOWED_CERT_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

async function downloadAndCache(url: string, cacheKey?: string) {
  if (!cacheKey) {
    cacheKey = url.replaceAll(/\W+/g, '-');
  }
  const filePath = path.join(CACHE_DIR, cacheKey);

  const cachedData = await fs.readFile(filePath, 'utf-8').catch(() => null);
  if (cachedData) {
    return cachedData;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`certificate download failed with status ${response.status}`);
  }

  const data = await response.text();

  // Que la caché falle no puede tumbar la verificación: el certificado ya está
  // descargado y sirve igual. Se registra y se sigue.
  await fs.writeFile(filePath, data).catch((error) => {
    log.warn(error, 'could not cache paypal certificate', filePath);
  });

  return data;
}

export async function verifySignature(event: string|Buffer, headers: ReadonlyHeaders) {
  const transmissionId = headers.get('paypal-transmission-id');
  const timeStamp = headers.get('paypal-transmission-time');
  const certUrl = headers.get('paypal-cert-url');
  const transmissionSig = headers.get('paypal-transmission-sig');

  if (!transmissionId || !timeStamp || !certUrl || !transmissionSig) {
    log.warn('Missing signature headers');
    return false;
  }

  if (!WEBHOOK_ID) {
    log.error('WEBHOOK_ID is not configured; cannot verify signatures');
    return false;
  }

  if (!isTrustedCertUrl(certUrl)) {
    log.warn('Certificate url is not a paypal host: %s', certUrl);
    return false;
  }

  const crc = Number.parseInt('0x' + crc32(event, '').toString('hex'));
  const message = `${transmissionId}|${timeStamp}|${WEBHOOK_ID}|${crc}`;

  let certPem: string;
  try {
    certPem = await downloadAndCache(certUrl);
  } catch (error) {
    log.error(error, 'could not obtain paypal certificate: %s', certUrl);
    return false;
  }

  const signatureBuffer = Buffer.from(transmissionSig, 'base64');
  const verifier = crypto.createVerify('SHA256');
  verifier.update(message);

  try {
    return verifier.verify(certPem, signatureBuffer);
  } catch (error) {
    log.warn(error, 'signature verification threw');
    return false;
  }
}