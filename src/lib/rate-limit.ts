import { prisma } from "./prisma";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  chat: { windowMs: 60 * 1000, maxRequests: 30 },
  generate: { windowMs: 60 * 1000, maxRequests: 10 },
  conversations: { windowMs: 60 * 1000, maxRequests: 60 },
  assets: { windowMs: 60 * 1000, maxRequests: 60 },
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 20 },
};

const DB_TIMEOUT_MS = 2000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("db-timeout")), ms)),
  ]);
}

export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  config?: Partial<RateLimitConfig>
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const { windowMs, maxRequests } = {
    ...DEFAULT_CONFIGS[endpoint],
    ...config,
  };

  const windowStart = new Date(Date.now() - windowMs);

  let count = 0;
  try {
    const result = await withTimeout(
      prisma.rateLimit.aggregate({
        where: {
          identifier,
          endpoint,
          windowStart: { gte: windowStart },
        },
        _count: true,
      }),
      DB_TIMEOUT_MS
    );
    count = result._count;
  } catch {
    // DB unreachable — allow all requests
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: new Date(Date.now() + windowMs),
    };
  }

  const allowed = count < maxRequests;

  if (allowed) {
    withTimeout(
      prisma.rateLimit.create({
        data: {
          identifier,
          endpoint,
          windowStart: new Date(),
        },
      }),
      DB_TIMEOUT_MS
    ).catch(() => {});
  }

  return {
    allowed,
    remaining: Math.max(0, maxRequests - count - (allowed ? 1 : 0)),
    resetAt: new Date(Date.now() + windowMs),
  };
}

// ─── In-memory rate limiter (for edge runtime / middleware) ──

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimitSync(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (bucket.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count++;
  return { allowed: true, remaining: maxRequests - bucket.count };
}
