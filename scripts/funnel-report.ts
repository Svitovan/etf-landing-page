import { memoryStore, getSupabaseServerClient } from "../src/lib/server/db";

type Session = { id: string; utm_content: string | null; is_test?: boolean };
type Event = { session_id: string | null; event_name: string; properties?: Record<string, unknown> };
type Submission = { request_id: string; lead_id: string; analytics_session_id: string | null; is_test?: boolean };
export interface FunnelStats {
  scope: "non_test_only";
  observedSessions: number;
  calculatorUsed: number;
  formStarted: number;
  totalSubmissions: number;
  uniqueLeads: number;
  reportsOpened: number;
  observedCvrPercent: string;
  excludedTestSessions: number;
  excludedTestSubmissions: number;
  utmBreakdown: Record<string, { sessions: number; submissions: number }>;
}

export function aggregateFunnel(sessions: Session[], events: Event[], submissions: Submission[]): FunnelStats {
  const testRequests = new Set(submissions.filter(s => s.is_test).map(s => s.request_id));
  const excluded = new Set<string>(sessions.filter(s => s.is_test).map(s => s.id));
  for (const sub of submissions) if (sub.is_test && sub.analytics_session_id) excluded.add(sub.analytics_session_id);
  // Covers historical split sessions and attempts delivered after the submission.
  for (const event of events) if (event.session_id && event.event_name === "form_submit_attempted"
    && typeof event.properties?.requestId === "string" && testRequests.has(event.properties.requestId)) excluded.add(event.session_id);
  const eligibleSessionIds = new Set(sessions.filter(s => !excluded.has(s.id)).map(s => s.id));
  const eligibleEvents = events.filter(e => e.session_id && eligibleSessionIds.has(e.session_id));
  const landing = new Set(eligibleEvents.filter(e => e.event_name === "landing_observed").map(e => e.session_id!));
  const eligibleSubmissions = submissions.filter(s => !s.is_test && (!s.analytics_session_id || !excluded.has(s.analytics_session_id)));
  const converted = new Set(eligibleSubmissions.filter(s => s.analytics_session_id && landing.has(s.analytics_session_id)).map(s => s.analytics_session_id));
  const countEvent = (name: string) => new Set(eligibleEvents.filter(e => e.event_name === name && landing.has(e.session_id!)).map(e => e.session_id)).size;
  const utmBreakdown: FunnelStats["utmBreakdown"] = {
    ad_a: { sessions: 0, submissions: 0 }, ad_b: { sessions: 0, submissions: 0 }, direct_other: { sessions: 0, submissions: 0 },
  };
  for (const session of sessions) {
    if (!landing.has(session.id)) continue;
    const key = session.utm_content === "ad_a" || session.utm_content === "ad_b" ? session.utm_content : "direct_other";
    utmBreakdown[key].sessions += 1;
    if (converted.has(session.id)) utmBreakdown[key].submissions += 1;
  }
  return {
    scope: "non_test_only", observedSessions: landing.size,
    calculatorUsed: countEvent("calculator_used"), formStarted: countEvent("form_started"),
    totalSubmissions: eligibleSubmissions.length, uniqueLeads: new Set(eligibleSubmissions.map(s => s.lead_id)).size,
    reportsOpened: countEvent("report_opened"),
    observedCvrPercent: landing.size ? `${(converted.size / landing.size * 100).toFixed(1)} %` : "N/A (žádné pozorované netestovací relace)",
    excludedTestSessions: sessions.filter(s => excluded.has(s.id)).length,
    excludedTestSubmissions: submissions.length - eligibleSubmissions.length,
    utmBreakdown,
  };
}

export async function generateFunnelReport(): Promise<FunnelStats> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    if (process.env.NODE_ENV === "production") throw new Error("REPORT_STORAGE_NOT_CONFIGURED");
    return aggregateFunnel(memoryStore.sessions, memoryStore.events, memoryStore.submissions);
  }
  // Stable pagination; never silently truncate at the REST API's default limit.
  async function readAll<T>(table: string, columns: string): Promise<T[]> {
    const rows: T[] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await supabase!.from(table).select(columns).order("id").range(offset, offset + 999);
      if (error || !Array.isArray(data)) throw new Error("REPORT_DATABASE_READ_FAILED");
      rows.push(...data as T[]);
      if (data.length < 1000) return rows;
    }
  }
  const [sessions, events, submissions] = await Promise.all([
    readAll<Session>("analytics_sessions", "id,utm_content,is_test"),
    readAll<Event>("analytics_events", "session_id,event_name,properties"),
    readAll<Submission>("lead_submissions", "request_id,lead_id,analytics_session_id,is_test"),
  ]);
  return aggregateFunnel(sessions, events, submissions);
}

async function run() {
  const stats = await generateFunnelReport();
  console.log("=== ETF PŘEHLED - NETESTOVACÍ KONVERZNÍ TRYCHTÝŘ ===");
  console.log(`Vygenerováno: ${new Date().toISOString()}`);
  console.log("Pouze neoznačený netestovací provoz; UTM není důkaz placené reklamy. Bez osobních údajů.");
  console.log(`Vyloučeno testovacích relací: ${stats.excludedTestSessions}; odeslání: ${stats.excludedTestSubmissions}`);
  console.log(`1. Sledované relace se souhlasem (landing_observed): ${stats.observedSessions}`);
  console.log(`2. Použití kalkulačky: ${stats.calculatorUsed}`);
  console.log(`3. Zahájení formuláře: ${stats.formStarted}`);
  console.log(`4. Netestovací odeslání (včetně bez analytiky): ${stats.totalSubmissions}`);
  console.log(`5. Unikátní kontakty netestovacích odeslání: ${stats.uniqueLeads}`);
  console.log(`6. Otevření reportu: ${stats.reportsOpened}`);
  console.log(`Konverze pozorované skupiny (Observed CVR): ${stats.observedCvrPercent}`);
  for (const [key, row] of Object.entries(stats.utmBreakdown)) console.log(` - ${key}: ${row.sessions} relací, ${row.submissions} konverzí`);
}
if (/(^|[\\/])funnel-report\.ts$/.test(process.argv[1] || "")) {
  run().catch(() => {
    console.error("Funnel report failed: data could not be read. No statistics were produced.");
    process.exitCode = 1;
  });
}
