export interface IAlert {
  id: number|string;
  title: string;
  message: string;
}

/** INACTIVO: exportado pero sin referencias en el repositorio (rev. 2026-08-09). */
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
  link_id: string;
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

export interface ILinkBreakdown {
  link_id: string;
  total_clicks: number;
  unique_ips: number;
  country_counts: Record<string, number>;
  browser_counts: Record<string, number>;
  os_counts: Record<string, number>;
  device_type_counts: Record<string, number>;
}

export interface ILinkStatsSummary {
  link_id: string;
  stats: ILinkDateStats[];
  breakdown: ILinkBreakdown;
}

export interface IRefererStat {
  referer: string;
  count: number;
}

export type UserUrl = {
  link_id: string;
  slug: string;
  alias: string | null;
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