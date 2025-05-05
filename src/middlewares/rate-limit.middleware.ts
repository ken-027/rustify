export const runtime = "nodejs";

export const dynamic = "force-dynamic";

import { RATE_LIMIT } from "@/config/index.config";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(RATE_LIMIT, "1 d"), // 1 request per day
  prefix: "@upstash/ratelimit",
  analytics: false,
});

export default ratelimit;
