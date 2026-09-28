import 'server-only';
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export function getGeoLocation(headers: ReadonlyHeaders) {
  const sanitize = (str: string|null) => str && decodeURI(str.trim());

  const ip = getClientIp(headers);
  const countryCode = getClientCountryCode(headers);
  const region = getClientRegion(headers);
  const city = getClientCity(headers);
  const latitude = headers.get('x-vercel-ip-latitude');
  const longitude = headers.get('x-vercel-ip-longitude');

  return {
    ip: ip,
    countryCode: sanitize(countryCode),
    region: sanitize(region),
    city: sanitize(city),
    latitude: latitude,
    longitude: longitude,
  };
}

export function getRateLimitGeo(headers: Headers|ReadonlyHeaders) {
  return {
    ip: getClientIp(headers) ?? undefined,
    city: getClientCity(headers) ?? undefined,
    region: getClientRegion(headers) ?? undefined,
    country: getClientCountryCode(headers) ?? undefined,
  };
}

export function getClientIp(headers: Headers|ReadonlyHeaders): string | null {
  return (headers.get('x-vercel-forwarded-for')
    ?? headers.get('x-forwarded-for')
    ?? headers.get('x-real-ip'));
}

export function getClientCountryCode(headers: Headers|ReadonlyHeaders): string | null {
  return headers.get('x-vercel-ip-country');
}

export function getClientRegion(headers: Headers|ReadonlyHeaders): string | null {
  return headers.get('x-vercel-ip-country-region');
}

export function getClientCity(headers: Headers|ReadonlyHeaders): string | null {
  return headers.get('x-vercel-ip-city');
}
