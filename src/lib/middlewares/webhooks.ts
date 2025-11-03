import { type NextRequest, NextResponse } from "next/server";

export async function checkWebhook(request: NextRequest) {
  const headers = request.headers;

  const isValidHeaders = verifyHeaders(headers);
  if(!isValidHeaders || request.body === null) {
    return NextResponse.json(
      { error: "Invalid headers" },
      { status: 400 });
  }
}

function verifyHeaders(headers: Headers): boolean {
  if(!headers.has('x-vercel-internal-bot-name')
    || headers.get('x-vercel-internal-bot-name') !== 'paypal') {
    return false;
  }

  if(!headers.has('x-vercel-internal-bot-category')
    || headers.get('x-vercel-internal-bot-category') !== 'webhook') {
    return false;
  }

  if(!headers.has('x-vercel-internal-bot-check')
  || headers.get('x-vercel-internal-bot-check') !== 'pass') {
    return false;
  }

  if(  !headers.has('paypal-transmission-id')
    || !headers.has('paypal-transmission-sig')
    || !headers.has('paypal-transmission-time')
    || !headers.has('paypal-auth-algo')
    || !headers.has('paypal-cert-url')
  ) {
    return false;
  }

  return true;
}
