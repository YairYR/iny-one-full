import { NextRequest, NextResponse } from "next/server";
import { getClientIp, getRateLimitGeo } from "@/lib/utils/geolocation";
import { rateLimiters, RatelimitResponse } from "@/lib/rate-limit/rate-limiter";

/**
 * Basic rate limiting middleware for API requests.
 * @param {NextRequest} request
 * @returns {Promise<Response|void>} Returns a Response if the request exceeds the limit, void otherwise.
 */
export async function checkRequestRateLimit(request: NextRequest): Promise<NextResponse|void> {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const ip = getClientIp(request.headers) ?? 'unknown';
  const geo = getRateLimitGeo(request.headers);

  const global = await rateLimiters.global.limit(ip, { geo });
  if (!global.success) {
    return getRateLimitResponse(global);
  }

  const burst = await rateLimiters.globalBurst.limit(ip, { geo });
  if (!burst.success) {
    return getRateLimitResponse(burst);
  }
}

function getRateLimitResponse(result: RatelimitResponse) {
  return new NextResponse("Too Many Requests", {
    status: 429,
    headers: {
      "Retry-After": String(
        Math.max(
          1,
          Math.ceil((result.reset - Date.now()) / 1000),
        ),
      ),
      "X-RateLimit-Limit": String(result.limit),
      "X-RateLimit-Remaining": String(
        Math.max(0, result.remaining),
      ),
      "X-RateLimit-Reset": String(result.reset),
    },
  });
}