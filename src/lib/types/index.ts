import type { userAgent } from "next/server";

export interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  id: string;
}

export interface ClientInfo {
  ip: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  latitude: string | null;
  longitude: string | null;
  userAgent?: ReturnType<typeof userAgent>;
  referer?: string | null;
}

export interface UrlHistory<Utm = UtmParams> {
  [key: string]: ShortenedUrl<Utm>;
}

export interface ShortenedUrl<Utm = UtmParams> {
  url: string;
  short: string;
  utm: Utm;
}

export interface ApiResponse<T = never> {
  code: number;
  message: string;
  data: T;
}

export interface UserClient {
  email?: string;
  name: string | null;
  picture: string | null;
  created_at: string;
}
