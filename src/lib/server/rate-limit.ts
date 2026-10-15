import crypto from "node:crypto";
import { memoryStore, getSupabaseServerClient } from "./db";

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 10; // 10 submissions per 10 minutes (generous for testing)

export async function checkRateLimit(
  rawIdentifier: string
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  // Hash the identifier to avoid storing raw client IPs
  const salt = process.env.RATE_LIMIT_SECRET || "default-etf-rate-limit-salt";
  const bucketKey = crypto
    .createHmac("sha256", salt)
    .update(rawIdentifier)
    .digest("hex")
    .substring(0, 32);

  const now = Date.now();
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_bucket_key: bucketKey,
      p_max_requests: MAX_REQUESTS,
      p_window_seconds: Math.floor(WINDOW_MS / 1000),
    });

    if (error) {
      console.error("Supabase rate limit RPC error:", error);
      if (process.env.NODE_ENV === "production") {
        throw new Error(`RATE_LIMIT_STORAGE_ERROR: ${error.message}`);
      }
    } else if (data && typeof data.allowed === "boolean") {
      return {
        allowed: data.allowed,
        retryAfterSeconds: data.retry_after_seconds || 0,
      };
    }
  }

  // Memory fallback
  const existing = memoryStore.rateLimits.get(bucketKey);
  if (existing) {
    if (now < existing.expiresAt) {
      if (existing.count >= MAX_REQUESTS) {
        return {
          allowed: false,
          retryAfterSeconds: Math.ceil((existing.expiresAt - now) / 1000),
        };
      }
      existing.count += 1;
      return { allowed: true, retryAfterSeconds: 0 };
    }
  }

  memoryStore.rateLimits.set(bucketKey, {
    count: 1,
    expiresAt: now + WINDOW_MS,
  });

  return { allowed: true, retryAfterSeconds: 0 };
}
