export interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
}

export interface ClientInfo {
  ip: string | null;
  countryCode: string | null;
}

export interface UrlHistory {
  [key: string]: ShortenedUrl;
}

export interface ShortenedUrl {
  url: string;
  short: string;
  utm: UtmParams;
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
