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
    try {
      const { data } = await supabase
        .from("rate_limit_buckets")
        .select("request_count, expires_at")
        .eq("bucket_key", bucketKey)
        .single();

      if (data) {
        const expiresAt = new Date(data.expires_at).getTime();
        if (now < expiresAt) {
          if (data.request_count >= MAX_REQUESTS) {
            return {
              allowed: false,
              retryAfterSeconds: Math.ceil((expiresAt - now) / 1000),
            };
          }
          await supabase
            .from("rate_limit_buckets")
            .update({ request_count: data.request_count + 1 })
            .eq("bucket_key", bucketKey);
          return { allowed: true, retryAfterSeconds: 0 };
        }
      }

      // Create new or reset expired bucket
      const expiresAtIso = new Date(now + WINDOW_MS).toISOString();
      await supabase.from("rate_limit_buckets").upsert({
        bucket_key: bucketKey,
        request_count: 1,
        expires_at: expiresAtIso,
      });
      return { allowed: true, retryAfterSeconds: 0 };
    } catch {
      // In case of transient rate limit db error, fall through safely
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
