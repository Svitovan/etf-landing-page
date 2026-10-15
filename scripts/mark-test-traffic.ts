import { getSupabaseServerClient } from "../src/lib/server/db";

export async function markTestTraffic(options: { requestId?: string; sessionId?: string; apply?: boolean }) {
  if (Boolean(options.requestId) === Boolean(options.sessionId) ||
    [options.requestId, options.sessionId].some(value => value !== undefined && (value.length < 1 || value.length > 200))) {
    throw new Error("INVALID_TEST_TRAFFIC_TARGET");
  }
  const client = getSupabaseServerClient();
  if (!client) throw new Error("TEST_TRAFFIC_STORAGE_REQUIRED");
  const dryRun = options.apply !== true;
  const { data, error } = await client.rpc("mark_test_traffic", {
    p_request_id: options.requestId ?? null, p_session_id: options.sessionId ?? null, p_dry_run: dryRun,
  });
  if (error || !data || data.dryRun !== dryRun ||
    ![data.submissionsMatched, data.sessionsMatched].every(n => Number.isSafeInteger(n) && n >= 0)) throw new Error("TEST_TRAFFIC_MARK_FAILED");
  return { dryRun, submissionsMatched: data.submissionsMatched as number, sessionsMatched: data.sessionsMatched as number };
}
async function run() {
  const args = process.argv.slice(2);
  if (new Set(args).size !== args.length || args.some(a => a !== "--apply" && !a.startsWith("--request-id=") && !a.startsWith("--session-id="))
    || args.filter(a => a.startsWith("--request-id=")).length > 1 || args.filter(a => a.startsWith("--session-id=")).length > 1) throw new Error("INVALID_ARGUMENTS");
  const result = await markTestTraffic({
    requestId: args.find(a => a.startsWith("--request-id="))?.slice(13),
    sessionId: args.find(a => a.startsWith("--session-id="))?.slice(13), apply: args.includes("--apply"),
  });
  console.log(result.dryRun ? "Test traffic preview (nothing changed):" : "Test traffic marked (records retained):");
  console.log(JSON.stringify(result));
}
if (/(^|[\\/])mark-test-traffic\.ts$/.test(process.argv[1] || "")) run().catch(() => {
  console.error("Test traffic classification failed. No successful result is available."); process.exitCode = 1;
});
