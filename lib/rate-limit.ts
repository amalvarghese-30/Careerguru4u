// lib/rate-limit.ts
// Simple in-memory sliding-window rate limiter.
// NOTE: state lives in a single process/instance. For a horizontally-scaled
// deployment, replace this with a shared store (Redis/Upstash) so limits are
// enforced globally across instances.

type Bucket = { count: number; resetAt: number };

const globalForRateLimit = globalThis as unknown as {
  _rateLimitBuckets?: Map<string, Bucket>;
};

const buckets: Map<string, Bucket> =
  globalForRateLimit._rateLimitBuckets ?? new Map<string, Bucket>();
globalForRateLimit._rateLimitBuckets = buckets;

const MAX_BUCKETS = 10_000;

function prune(now: number) {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(key: string, opts: RateLimitOptions = {}): RateLimitResult {
  const windowMs = opts.windowMs ?? 60_000;
  const max = opts.max ?? 10;
  const now = Date.now();

  prune(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, retryAfterSec: 0 };
  }

  existing.count += 1;
  if (existing.count > max) {
    return { ok: false, remaining: 0, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: max - existing.count, retryAfterSec: 0 };
}

export function getClientIp(req: { headers: Headers }): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
