import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitBucket =
  | "checkout"
  | "instagram-video"
  | "artwork-image"
  | "contact"
  | "trade-inquiry"
  | "site-document";

interface MemoryEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryEntry>();

const limiterCache = new Map<RateLimitBucket, Ratelimit>();

const BUCKET_CONFIG: Record<
  RateLimitBucket,
  { requests: number; window: `${number} ${"s" | "m" | "h" | "d"}`; windowMs: number }
> = {
  checkout: { requests: 10, window: "10 m", windowMs: 10 * 60 * 1000 },
  "instagram-video": { requests: 20, window: "1 h", windowMs: 60 * 60 * 1000 },
  "artwork-image": { requests: 120, window: "10 m", windowMs: 10 * 60 * 1000 },
  contact: { requests: 5, window: "1 h", windowMs: 60 * 60 * 1000 },
  "trade-inquiry": { requests: 5, window: "1 h", windowMs: 60 * 60 * 1000 },
  "site-document": { requests: 60, window: "10 m", windowMs: 10 * 60 * 1000 },
};

function getUpstashLimiter(bucket: RateLimitBucket): Ratelimit | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }

  if (!limiterCache.has(bucket)) {
    const config = BUCKET_CONFIG[bucket];
    limiterCache.set(
      bucket,
      new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(config.requests, config.window),
        prefix: `colors-n-joy:${bucket}`,
        analytics: false,
      }),
    );
  }

  return limiterCache.get(bucket) ?? null;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function checkMemoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count += 1;
  memoryStore.set(key, entry);
  return true;
}

export async function enforceRateLimit(
  request: Request,
  bucket: RateLimitBucket,
): Promise<Response | null> {
  const ip = getClientIp(request);
  const identifier = `${bucket}:${ip}`;
  const upstashLimiter = getUpstashLimiter(bucket);

  if (upstashLimiter) {
    const result = await upstashLimiter.limit(identifier);

    if (!result.success) {
      return Response.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (result.reset - Date.now()) / 1000,
            ).toString(),
          },
        },
      );
    }

    return null;
  }

  const config = BUCKET_CONFIG[bucket];
  const allowed = checkMemoryRateLimit(
    identifier,
    config.requests,
    config.windowMs,
  );

  if (!allowed) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  return null;
}
