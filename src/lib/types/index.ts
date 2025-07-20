export type Utm = {
  name: string;
  content: string;
}

export type ShortenUrl = {
  id: number;
  subdomain: string|null;
  domain:    string;
  path:      string|null;
  hash:      string|null;
  short:     string;
  protocol:  string;
  active:    boolean;
  updatedAt: Date|null;
  createdAt: Date;
  utms:      Utm[];
  // owner     User;
  userId:    number|null;
}