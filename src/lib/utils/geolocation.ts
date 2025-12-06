import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export function getGeoLocation(headers: ReadonlyHeaders) {
  const sanitize = (str: string|null) => str && decodeURI(str.trim());

  const ip = (headers.get('x-vercel-forwarded-for')
                      ?? headers.get('x-forwarded-for')
                      ?? headers.get('x-real-ip'));
  const countryCode = headers.get('x-vercel-ip-country');
  const region = headers.get('x-vercel-ip-country-region');
  const city = headers.get('x-vercel-ip-city');
  const latitude = headers.get('x-vercel-ip-latitude');
  const longitude = headers.get('x-vercel-ip-longitude');

  return {
    ip: ip,
    countryCode: sanitize(countryCode),
    region: sanitize(region),
    city: sanitize(city),
    latitude: latitude,
    longitude: longitude,
  }
}
