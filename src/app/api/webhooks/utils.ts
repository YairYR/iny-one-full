import crypto from "node:crypto";
import fs from 'node:fs/promises';
// @ts-expect-error has default export
import crc32 from 'buffer-crc32';

const CACHE_DIR = process.env.CACHE_DIR || '/tmp';
const WEBHOOK_ID = process.env.WEBHOOK_ID;

async function downloadAndCache(url: string, cacheKey?: string) {
  if (!cacheKey) {
    cacheKey = url.replaceAll(/\W+/, '-');
  }
  const filePath = `${CACHE_DIR}/${cacheKey}`;

  const cachedData = await fs.readFile(filePath, 'utf-8').catch(() => null);
  if (cachedData) {
    return cachedData;
  }

  const response = await fetch(url);
  const data = await response.text();

  await fs.writeFile(filePath, data);
  return data;
}

export async function verifySignature(event: string|Buffer, headers: Headers) {
  const transmissionId = headers.get('paypal-transmission-id') as string;
  const timeStamp = headers.get('paypal-transmission-time') as string;
  const certUrl = headers.get('paypal-cert-url') as string;
  const transmissionSig = headers.get('paypal-transmission-sig') as string;

  const crc = Number.parseInt('0x' + crc32(event, '').toString('hex'));

  const message = `${transmissionId}|${timeStamp}|${WEBHOOK_ID}|${crc}`;
  console.log('🧩 Original signed message:', message);

  const certPem = await downloadAndCache(certUrl);
  const signatureBuffer = Buffer.from(transmissionSig, 'base64');
  const verifier = crypto.createVerify('SHA256');
  verifier.update(message);

  return verifier.verify(certPem, signatureBuffer);
}

