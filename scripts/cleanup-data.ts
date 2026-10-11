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

export async function cleanupData(options: CleanupOptions = {}): Promise<CleanupResult> {
  const olderThanDays = options.olderThanDays ?? 30;
  const dryRun = options.dryRun ?? false;
  const targetEmail = options.targetEmail ? options.targetEmail.trim().toLowerCase() : undefined;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  const cutoffIso = cutoffDate.toISOString();

  const rateLimitCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const supabase = getSupabaseServerClient();

  if (supabase) {
    let leadsToDeleteIds: string[] = [];

    if (targetEmail) {
      const { data: targetLeads } = await supabase
        .from("leads")
        .select("id")
        .eq("normalized_email", targetEmail);
      leadsToDeleteIds = (targetLeads || []).map((l) => l.id);
    } else {
      const { data: expiredLeads } = await supabase
        .from("leads")
        .select("id")
        .lt("created_at", cutoffIso);
      leadsToDeleteIds = (expiredLeads || []).map((l) => l.id);
    }

    let submissionsCount = 0;
    if (leadsToDeleteIds.length > 0) {
      const { count } = await supabase
        .from("lead_submissions")
        .select("id", { count: "exact", head: true })
        .in("lead_id", leadsToDeleteIds);
      submissionsCount = count || 0;
    }

    const { count: eventsCount } = await supabase
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .lt("server_timestamp", cutoffIso);

    const { count: sessionsCount } = await supabase
      .from("analytics_sessions")
      .select("id", { count: "exact", head: true })
      .lt("created_at", cutoffIso);

    const { count: rateLimitsCount } = await supabase
      .from("rate_limit_buckets")
      .select("id", { count: "exact", head: true })
      .lt("created_at", rateLimitCutoff);

    if (!dryRun) {
      if (leadsToDeleteIds.length > 0) {
        await supabase.from("lead_submissions").delete().in("lead_id", leadsToDeleteIds);
        await supabase.from("leads").delete().in("id", leadsToDeleteIds);
      }
      await supabase.from("analytics_events").delete().lt("server_timestamp", cutoffIso);
      await supabase.from("analytics_sessions").delete().lt("created_at", cutoffIso);
      await supabase.from("rate_limit_buckets").delete().lt("created_at", rateLimitCutoff);
    }

    return {
      dryRun,
      leadsDeleted: leadsToDeleteIds.length,
      submissionsDeleted: submissionsCount,
      eventsDeleted: eventsCount || 0,
      sessionsDeleted: sessionsCount || 0,
      rateLimitsDeleted: rateLimitsCount || 0,
    };
  }

  // MemoryStore fallback (local / testing)
  let leadsToDeleteIds: string[] = [];
  if (targetEmail) {
    leadsToDeleteIds = memoryStore.leads
      .filter((l) => l.normalized_email === targetEmail)
      .map((l) => l.id);
  } else {
    leadsToDeleteIds = memoryStore.leads
      .filter((l) => l.created_at < cutoffIso)
      .map((l) => l.id);
  }

  const submissionsToDelete = memoryStore.submissions.filter((s) =>
    leadsToDeleteIds.includes(s.lead_id)
  );
  const eventsToDelete = memoryStore.events.filter((e) => e.server_timestamp < cutoffIso);
  const sessionsToDelete = memoryStore.sessions.filter((s) => s.created_at < cutoffIso);

  const nowMs = Date.now();
  let rateLimitsExpired = 0;
  for (const [, val] of memoryStore.rateLimits.entries()) {
    if (val.expiresAt < nowMs) rateLimitsExpired++;
  }

  if (!dryRun) {
    memoryStore.submissions = memoryStore.submissions.filter(
      (s) => !leadsToDeleteIds.includes(s.lead_id)
    );
    memoryStore.leads = memoryStore.leads.filter((l) => !leadsToDeleteIds.includes(l.id));
    memoryStore.events = memoryStore.events.filter((e) => e.server_timestamp >= cutoffIso);
    memoryStore.sessions = memoryStore.sessions.filter((s) => s.created_at >= cutoffIso);
    for (const [key, val] of memoryStore.rateLimits.entries()) {
      if (val.expiresAt < nowMs) {
        memoryStore.rateLimits.delete(key);
      }
    }
  }

  return {
    dryRun,
    leadsDeleted: leadsToDeleteIds.length,
    submissionsDeleted: submissionsToDelete.length,
    eventsDeleted: eventsToDelete.length,
    sessionsDeleted: sessionsToDelete.length,
    rateLimitsDeleted: rateLimitsExpired,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");
  const olderThanArg = args.find((a) => a.startsWith("--days="));
  const olderThanDays = olderThanArg ? parseInt(olderThanArg.split("=")[1], 10) : 30;
  const emailArg = args.find((a) => a.startsWith("--email="));
  const targetEmail = emailArg ? emailArg.split("=")[1] : undefined;

  console.log(`Starting data cleanup...`);
  console.log(`Mode: ${isDryRun ? "DRY RUN (no changes will be applied)" : "LIVE EXECUTION"}`);
  console.log(`Retention threshold: ${olderThanDays} days`);
  if (targetEmail) {
    console.log(`Targeting specific email: ${targetEmail}`);
  }

  const result = await cleanupData({
    dryRun: isDryRun,
    olderThanDays,
    targetEmail,
  });

  console.log("\nCleanup summary:");
  console.log(`- Leads deleted: ${result.leadsDeleted}`);
  console.log(`- Submissions deleted: ${result.submissionsDeleted}`);
  console.log(`- Analytics events deleted: ${result.eventsDeleted}`);
  console.log(`- Analytics sessions deleted: ${result.sessionsDeleted}`);
  console.log(`- Expired rate limit buckets: ${result.rateLimitsDeleted}`);
  console.log(`\n✓ Cleanup finished successfully.`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Cleanup error:", err);
    process.exit(1);
  });
}
