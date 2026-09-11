// lib/rate-limit-redis.ts
// Redis-backed sliding-window rate limiter for distributed deployments.
// Falls back to in-memory if REDIS_URL not configured (dev only).

import { Redis } from "@upstash/redis";
import { getClientIp as getClientIpFromMemory } from "./rate-limit";
import { logger } from "./logger";

const globalForRedis = globalThis as unknown as { _redis?: Redis };

export const getClientIp = getClientIpFromMemory;

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL || !process.env.REDIS_TOKEN) {
    logger.warn("[RATE-LIMIT] REDIS_URL/TOKEN not set; using in-memory fallback");
    return null;
  }

  if (globalForRedis._redis) return globalForRedis._redis;

  globalForRedis._redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
  });
  return globalForRedis._redis;
}

interface RedisRateLimitOptions {
  windowMs?: number;
  max?: number;
  prefix?: string;
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

/**
 * Sliding-window rate limit with Redis (Upstash).
 * Key format: "ratelimit:{prefix}:{key}"
 * Uses sorted set with timestamps as scores for precise sliding window.
 */
export async function rateLimitRedis(
  key: string,
  opts: RedisRateLimitOptions = {}
): Promise<RateLimitResult> {
  const windowMs = opts.windowMs ?? 60_000; // 1 minute default
  const max = opts.max ?? 10;
  const prefix = opts.prefix ?? "api";
  const now = Date.now();
  const windowStart = now - windowMs;

  const redis = getRedis();

  // Fallback to in-memory if Redis not available
  if (!redis) {
    const { rateLimit } = await import("./rate-limit");
    return rateLimit(key, { windowMs, max });
  }

  const redisKey = `ratelimit:${prefix}:${key}`;

  try {
    // Remove expired entries
    await redis.zremrangebyscore(redisKey, 0, windowStart);

    // Count current requests in window
    const count = await redis.zcard(redisKey);

    if (count >= max) {
      // Get oldest entry to calculate retry-after
      const oldest = await redis.zrange(redisKey, 0, 0, { withScores: true });
      const oldestTime = oldest.length > 1 ? Number(oldest[1]) : now;
      const retryAfterSec = Math.ceil((oldestTime + windowMs - now) / 1000);
      return { ok: false, remaining: 0, retryAfterSec: Math.max(1, retryAfterSec) };
    }

    // Add current request
    await redis.zadd(redisKey, { score: now, member: `${now}-${Math.random()}` });

    // Set TTL slightly longer than window to allow cleanup
    await redis.expire(redisKey, Math.ceil(windowMs / 1000) + 10);

    return { ok: true, remaining: max - count - 1, retryAfterSec: 0 };
  } catch (error) {
    logger.error("[RATE-LIMIT] Redis error, falling back to in-memory:", error);
    const { rateLimit } = await import("./rate-limit");
    return rateLimit(key, { windowMs, max });
  }
}

/**
 * Login-specific rate limiter with stricter limits and lockout.
 * Returns lockout details when triggered.
 */
export interface LoginRateLimitResult extends RateLimitResult {
  lockedOut?: boolean;
  lockoutUntil?: number;
  attempts?: number;
}

const LOGIN_PREFIX = "login";
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_LOCKOUT_MS = 30 * 60 * 1000; // 30 minutes lockout

export async function rateLimitLogin(
  identifier: string // email or IP
): Promise<LoginRateLimitResult> {
  const redis = getRedis();
  const lockoutKey = `ratelimit:${LOGIN_PREFIX}:lockout:${identifier}`;
  const attemptKey = `ratelimit:${LOGIN_PREFIX}:attempt:${identifier}`;
  const now = Date.now();

  // Check if currently locked out
  if (redis) {
    try {
      const lockoutUntil = await redis.get<number>(lockoutKey);
      if (lockoutUntil && lockoutUntil > now) {
        return {
          ok: false,
          remaining: 0,
          retryAfterSec: Math.ceil((lockoutUntil - now) / 1000),
          lockedOut: true,
          lockoutUntil,
        };
      }
    } catch (e) {
      logger.error("[RATE-LIMIT] Lockout check error:", e);
    }
  }

  // Count failed attempts in window
  let attempts = 0;
  if (redis) {
    try {
      const windowStart = now - LOGIN_WINDOW_MS;
      await redis.zremrangebyscore(attemptKey, 0, windowStart);
      attempts = await redis.zcard(attemptKey);
    } catch (e) {
      logger.error("[RATE-LIMIT] Attempt count error:", e);
    }
  } else {
    // In-memory fallback
    const { rateLimit } = await import("./rate-limit");
    const result = rateLimit(attemptKey, { windowMs: LOGIN_WINDOW_MS, max: LOGIN_MAX_ATTEMPTS });
    attempts = LOGIN_MAX_ATTEMPTS - result.remaining - 1;
  }

  if (attempts >= LOGIN_MAX_ATTEMPTS) {
    const lockoutUntil = now + LOGIN_LOCKOUT_MS;
    if (redis) {
      try {
        await redis.set(lockoutKey, lockoutUntil, { ex: Math.ceil(LOGIN_LOCKOUT_MS / 1000) + 10 });
      } catch (e) {
        logger.error("[RATE-LIMIT] Lockout set error:", e);
      }
    }
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil(LOGIN_LOCKOUT_MS / 1000),
      lockedOut: true,
      lockoutUntil,
      attempts: LOGIN_MAX_ATTEMPTS,
    };
  }

  // Record this attempt
  if (redis) {
    try {
      await redis.zadd(attemptKey, { score: now, member: `${now}-${Math.random()}` });
      await redis.expire(attemptKey, Math.ceil(LOGIN_WINDOW_MS / 1000) + 10);
    } catch (e) {
      logger.error("[RATE-LIMIT] Record attempt error:", e);
    }
  }

  return {
    ok: true,
    remaining: LOGIN_MAX_ATTEMPTS - attempts - 1,
    retryAfterSec: 0,
    attempts: attempts + 1,
  };
}

/**
 * Clear login attempts on successful login
 */
export async function clearLoginAttempts(identifier: string): Promise<void> {
  const redis = getRedis();
  const attemptKey = `ratelimit:${LOGIN_PREFIX}:attempt:${identifier}`;
  const lockoutKey = `ratelimit:${LOGIN_PREFIX}:lockout:${identifier}`;

  if (redis) {
    try {
      await redis.del(attemptKey, lockoutKey);
    } catch (e) {
      logger.error("[RATE-LIMIT] Clear attempts error:", e);
    }
  }
}