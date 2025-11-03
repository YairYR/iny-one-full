import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error has default export
import crc32 from "buffer-crc32";
import fs from "fs/promises";
import fetch from 'node-fetch';
import crypto from 'node:crypto';
import path from "node:path";

export async function POST(request: NextRequest) {
  const headers = request.headers;
  const event = await request.text();
  const isValidSignature = await verifySignature(headers, event);
  // if(!isValidSignature) {
  //   return NextResponse.json(
  //     { error: "Invalid signature" },
  //     { status: 400 });
  // }

  return NextResponse.json({
    message: isValidSignature ? "Valid signature" : "Invalid signature",
  })
}


async function verifySignature(headers: Headers, event: string): Promise<boolean> {
  const transmissionId = headers.get('paypal-transmission-id') as string;
  const transmissionSig = headers.get('paypal-transmission-sig') as string;
  const timeStamp = headers.get('paypal-transmission-time') as string;
  const certUrl = headers.get('paypal-cert-url') as string;

  const crc = parseInt("0x" + crc32(event).toString('hex'));

  const message = `${transmissionId}|${timeStamp}|${WEBHOOK_ID}|${crc}`
  console.log(`Original signed message ${message}`);

  const certPem = await downloadAndCache(certUrl);

  // Create buffer from base64-encoded signature
  const signatureBuffer = Buffer.from(transmissionSig, 'base64');

  // Create a verification object
  const verifier = crypto.createVerify('SHA256');

  // Add the original message to the verifier
  verifier.update(message);

  return verifier.verify(certPem, signatureBuffer);
}

const CACHE_DIR = path.join('data', 'cache');
const WEBHOOK_ID = '0NH55953DH663215D';

async function downloadAndCache(url: string, cacheKey?: string) {
  if(!cacheKey) {
    cacheKey = url.replace(/\W+/g, '-')
  }
  const filePath = path.join(CACHE_DIR, cacheKey);

  // Check if cached file exists
  const cachedData = await fs.readFile(filePath, 'utf-8').catch(() => null);
  if (cachedData) {
    return cachedData;
  }

  // Download the file if not cached
  const response = await fetch(url);
  const data = await response.text()
  await fs.writeFile(filePath, data);

  return data;
}