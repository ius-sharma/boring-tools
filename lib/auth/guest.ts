import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

const MAX_GUEST_RUNS_PER_DAY = 3;

// In-Memory Fallback store for local dev or when Redis is not configured
const memoryStore = new Map<string, { count: number; expiresAt: number }>();

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token && !url.includes("placeholder")) {
    return new Redis({ url, token });
  }
  return null;
}

/**
 * Generates or extracts a hashed IP identifier for privacy and rate limiting
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp || "127.0.0.1";
  
  // SHA-256 hash to protect user privacy while preserving uniqueness
  return crypto.createHash("sha256").update(ip + (process.env.IP_SALT || "boring_salt_2026")).digest("hex").slice(0, 16);
}

/**
 * Extracts anonymous device session ID from cookies
 */
export function getAnonCookieId(req: NextRequest): string {
  const anonCookie = req.cookies.get("bt_anon_id")?.value;
  if (anonCookie) return anonCookie;
  return getClientIp(req);
}

/**
 * Checks whether the guest has remaining runs today
 */
export async function checkGuestQuota(
  req: NextRequest,
  _toolId?: string
): Promise<{ allowed: boolean; remaining: number; count: number }> {
  const clientKey = `guest:${getAnonCookieId(req)}:${new Date().toISOString().slice(0, 10)}`;
  const redis = getRedisClient();

  if (redis) {
    try {
      const count = (await redis.get<number>(clientKey)) || 0;
      const remaining = Math.max(0, MAX_GUEST_RUNS_PER_DAY - count);
      return {
        allowed: count < MAX_GUEST_RUNS_PER_DAY,
        remaining,
        count,
      };
    } catch (e) {
      console.warn("Redis guest check error, falling back to memory store:", e);
    }
  }

  // Memory fallback
  const now = Date.now();
  const entry = memoryStore.get(clientKey);
  if (!entry || entry.expiresAt < now) {
    return { allowed: true, remaining: MAX_GUEST_RUNS_PER_DAY, count: 0 };
  }

  const remaining = Math.max(0, MAX_GUEST_RUNS_PER_DAY - entry.count);
  return {
    allowed: entry.count < MAX_GUEST_RUNS_PER_DAY,
    remaining,
    count: entry.count,
  };
}

/**
 * Increments the guest's usage counter for today
 */
export async function incrementGuestQuota(
  req: NextRequest,
  _toolId?: string
): Promise<number> {
  const clientKey = `guest:${getAnonCookieId(req)}:${new Date().toISOString().slice(0, 10)}`;
  const redis = getRedisClient();

  if (redis) {
    try {
      const newCount = await redis.incr(clientKey);
      if (newCount === 1) {
        await redis.expire(clientKey, 86400); // 24 hours TTL
      }
      return newCount;
    } catch (e) {
      console.warn("Redis incr error, using memory fallback:", e);
    }
  }

  // Memory fallback
  const now = Date.now();
  const entry = memoryStore.get(clientKey);
  if (!entry || entry.expiresAt < now) {
    memoryStore.set(clientKey, { count: 1, expiresAt: now + 86400000 });
    return 1;
  }

  entry.count += 1;
  memoryStore.set(clientKey, entry);
  return entry.count;
}
