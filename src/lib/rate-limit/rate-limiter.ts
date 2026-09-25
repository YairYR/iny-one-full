import 'server-only';
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";
export type RatelimitResponse = ReturnType<typeof Ratelimit.prototype.limit> extends Promise<infer U> ? U : never;

const globalCache = new Map<string, number>();
const burstCache = new Map<string, number>();

export const rateLimiters = {
  global: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, "1 m"),
    prefix: "rl:global",
    ephemeralCache: globalCache,
    analytics: true
  }),

  globalBurst: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "10 s"),
    prefix: "rl:global-burst",
    ephemeralCache: burstCache,
    analytics: true,
  }),

  createLink: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "rl:create-link",
  }),

  createLinkAnonymous: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    prefix: "rl:create-link-anon",
  }),

  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "rl:auth",
  }),
};

