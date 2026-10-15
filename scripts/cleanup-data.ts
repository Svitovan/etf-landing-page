import { memoryStore, getSupabaseServerClient } from "../src/lib/server/db";

export interface CleanupOptions {
  olderThanDays?: number;
  dryRun?: boolean;
  targetEmail?: string;
}
export interface CleanupResult {
  dryRun: boolean;
  leadsDeleted: number;
  submissionsDeleted: number;
  eventsDeleted: number;
  sessionsDeleted: number;
  rateLimitsDeleted: number;
}
const countKeys = ["leadsDeleted", "submissionsDeleted", "eventsDeleted", "sessionsDeleted", "rateLimitsDeleted"] as const;

export async function cleanupData(options: CleanupOptions = {}): Promise<CleanupResult> {
  const days = options.olderThanDays ?? 30;
  const dryRun = options.dryRun ?? false;
  const email = options.targetEmail?.trim().toLowerCase();
  if (!Number.isInteger(days) || days < 1 || days > 365 || typeof dryRun !== "boolean" ||
      (options.targetEmail !== undefined && (!email || !email.includes("@")))) {
    throw new Error("INVALID_CLEANUP_OPTIONS");
  }
  const supabase = getSupabaseServerClient();
  if (supabase) {
    // One transaction; failures roll back every deletion. No provider row details in logs.
    const { data, error } = await supabase.rpc("cleanup_project_data", {
      p_older_than_days: days, p_dry_run: dryRun, p_target_email: email ?? null,
    });
    if (error) throw new Error("CLEANUP_DATABASE_FAILED");
    if (!data || data.dryRun !== dryRun || countKeys.some(key =>
      !Number.isSafeInteger(data[key]) || data[key] < 0)) {
      throw new Error("CLEANUP_INVALID_RESPONSE");
    }
    return data as CleanupResult;
  }
  if (process.env.NODE_ENV === "production") throw new Error("CLEANUP_STORAGE_NOT_CONFIGURED");

  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const ids = new Set(memoryStore.leads.filter(l => email
    ? l.normalized_email === email : l.created_at < cutoff).map(l => l.id));
  const removeSubmission = (s: typeof memoryStore.submissions[number]) =>
    ids.has(s.lead_id) || (!email && s.created_at < cutoff);
  const sessionIds = new Set(email ? [] : memoryStore.sessions.filter(s => s.created_at < cutoff).map(s => s.id));
  const result: CleanupResult = {
    dryRun, leadsDeleted: ids.size,
    submissionsDeleted: memoryStore.submissions.filter(removeSubmission).length,
    eventsDeleted: email ? 0 : memoryStore.events.filter(e => e.server_timestamp < cutoff).length,
    sessionsDeleted: sessionIds.size,
    rateLimitsDeleted: email ? 0 : [...memoryStore.rateLimits.values()].filter(v => v.expiresAt < Date.now()).length,
  };
  if (!dryRun) {
    memoryStore.submissions = memoryStore.submissions.filter(s => !removeSubmission(s));
    memoryStore.leads = memoryStore.leads.filter(l => !ids.has(l.id));
    if (!email) {
      memoryStore.events = memoryStore.events.filter(e => e.server_timestamp >= cutoff)
        .map(e => sessionIds.has(e.session_id || "") ? { ...e, session_id: null } : e);
      memoryStore.sessions = memoryStore.sessions.filter(s => !sessionIds.has(s.id));
      for (const [key, value] of memoryStore.rateLimits) if (value.expiresAt < Date.now()) memoryStore.rateLimits.delete(key);
    }
  }
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some(a => a !== "--dry-run" && !a.startsWith("--days=") && !a.startsWith("--email="))) {
    throw new Error("INVALID_CLEANUP_OPTIONS");
  }
  const days = args.find(a => a.startsWith("--days="));
  const email = args.find(a => a.startsWith("--email="));
  const result = await cleanupData({
    dryRun: args.includes("--dry-run"),
    olderThanDays: days === undefined ? 30 : Number(days.slice(7)),
    targetEmail: email === undefined ? undefined : email.slice(8),
  });
  console.log(result.dryRun ? "Cleanup preview (candidates only; nothing deleted):" : "Cleanup committed:");
  console.log(JSON.stringify(result));
}
if (/(^|[\\/])cleanup-data\.ts$/.test(process.argv[1] || "")) {
  main().catch(() => {
    console.error("Cleanup failed. No successful cleanup result is available.");
    process.exitCode = 1;
  });
}
