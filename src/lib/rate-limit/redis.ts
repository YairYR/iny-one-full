import 'server-only';
import { Redis } from "@upstash/redis";

export const redis = (process.env.NODE_ENV === "production")
    ? Redis.fromEnv()
    : {} as Redis;
