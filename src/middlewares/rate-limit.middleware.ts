export const dynamic = "force-dynamic";

import { RATE_LIMIT } from "@/config/index.config";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  }),
  limiter: Ratelimit.slidingWindow(RATE_LIMIT, "1 d"), // 1 request per day
  prefix: "@upstash/ratelimit",
  analytics: true,
});

export default ratelimit;
