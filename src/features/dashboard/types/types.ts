export interface IAlert {
  id: number|string;
  title: string;
  message: string;
}

export interface ILink {
  id: number|string;
  alias: string;
  dest: string;
  clicks: number;
  ctr: string;
  countryTop: string;
  deviceTop: string;
  created: string;
}

export interface ILinkStats {
  slug: string;
  total_clicks: number;
  unique_ips: number;
  last_click_at: string | null;
  country_counts: Record<string, number>;
  browser_counts: Record<string, number>;
  os_counts: Record<string, number>;
  device_type_counts: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface ILinkDateStats extends ILinkStats {
  date: string;
}

export type UserUrl = {
  slug: string;
  destination: string;
  created_at: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  clicks: number | null;
}

export type UserUrlStats = UserUrl & {
  stats?: ILinkStats;
}