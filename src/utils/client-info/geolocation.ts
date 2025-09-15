import { IncomingHttpHeaders } from "http";

export function getGeoLocation(headers: Record<string, string> | IncomingHttpHeaders) {
  const sanitize = (str: string|null) => str && decodeURI(str.trim());

  const ip = (headers['x-vercel-forwarded-for'] ?? headers['x-forwarded-for'] ?? headers['x-real-ip'] ?? null) as string;
  const countryCode = (headers['x-vercel-ip-country'] ?? null) as string;
  const region = (headers['x-vercel-ip-country-region'] ?? null) as string;
  const city = (headers['x-vercel-ip-city'] ?? null) as string;
  const latitude = (headers['x-vercel-ip-latitude'] ?? null) as string;
  const longitude = (headers['x-vercel-ip-longitude'] ?? null) as string;

  console.log('getGeoLocation', {
    ip,
    countryCode,
    region,
    city,
    latitude,
    longitude,
  })

  return {
    ip: ip,
    countryCode: sanitize(countryCode),
    region: sanitize(region),
    city: sanitize(city),
    latitude: latitude,
    longitude: longitude,
  }
}
