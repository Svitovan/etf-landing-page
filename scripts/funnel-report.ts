import { memoryStore, getSupabaseServerClient } from "../src/lib/server/db";

export interface FunnelStats {
  observedSessions: number;
  calculatorUsed: number;
  formStarted: number;
  totalSubmissions: number;
  uniqueLeads: number;
  reportsOpened: number;
  observedCvrPercent: string;
  utmBreakdown: Record<string, { sessions: number; submissions: number }>;
}

export async function generateFunnelReport(): Promise<FunnelStats> {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data: sessions, error: sessionsErr } = await supabase
      .from("analytics_sessions")
      .select("id, utm_content");
    if (sessionsErr) {
      throw new Error(`Failed to query analytics_sessions: ${sessionsErr.message}`);
    }

    const { data: events, error: eventsErr } = await supabase
      .from("analytics_events")
      .select("session_id, event_name");
    if (eventsErr) {
      throw new Error(`Failed to query analytics_events: ${eventsErr.message}`);
    }

    const { data: submissions, error: submissionsErr } = await supabase
      .from("lead_submissions")
      .select("id, request_id, lead_id, analytics_session_id");
    if (submissionsErr) {
      throw new Error(`Failed to query lead_submissions: ${submissionsErr.message}`);
    }

    const { data: leads, error: leadsErr } = await supabase
      .from("leads")
      .select("id");
    if (leadsErr) {
      throw new Error(`Failed to query leads: ${leadsErr.message}`);
    }

    const sessionList = sessions || [];
    const eventList = events || [];
    const submissionList = submissions || [];
    const leadList = leads || [];

    // B02: The denominator of conversion funnel MUST be distinct consented sessions with landing_observed!
    const landingObservedSessionIds = new Set(
      eventList
        .filter((e) => e.event_name === "landing_observed" && e.session_id)
        .map((e) => e.session_id as string)
    );

    const calcSessionIds = new Set(
      eventList.filter((e) => e.event_name === "calculator_used").map((e) => e.session_id)
    );
    const formStartedSessionIds = new Set(
      eventList.filter((e) => e.event_name === "form_started").map((e) => e.session_id)
    );
    const reportSessionIds = new Set(
      eventList.filter((e) => e.event_name === "report_opened").map((e) => e.session_id)
    );

    const convertedObservedSessions = new Set(
      submissionList
        .filter((s) => s.analytics_session_id && landingObservedSessionIds.has(s.analytics_session_id))
        .map((s) => s.analytics_session_id)
    );

    const utmBreakdown: Record<string, { sessions: number; submissions: number }> = {
      ad_a: { sessions: 0, submissions: 0 },
      ad_b: { sessions: 0, submissions: 0 },
      direct_other: { sessions: 0, submissions: 0 },
    };

    for (const sess of sessionList) {
      if (!landingObservedSessionIds.has(sess.id)) {
        continue;
      }
      const key = sess.utm_content === "ad_a" || sess.utm_content === "ad_b"
        ? sess.utm_content
        : "direct_other";
      utmBreakdown[key].sessions += 1;
      if (convertedObservedSessions.has(sess.id)) {
        utmBreakdown[key].submissions += 1;
      }
    }

    const cvr =
      landingObservedSessionIds.size > 0
        ? ((convertedObservedSessions.size / landingObservedSessionIds.size) * 100).toFixed(1)
        : "0.0";

    return {
      observedSessions: landingObservedSessionIds.size,
      calculatorUsed: calcSessionIds.size,
      formStarted: formStartedSessionIds.size,
      totalSubmissions: submissionList.length,
      uniqueLeads: leadList.length,
      reportsOpened: reportSessionIds.size,
      observedCvrPercent: `${cvr} %`,
      utmBreakdown,
    };
  }

  // Memory store fallback
  const sessionList = memoryStore.sessions;
  const eventList = memoryStore.events;
  const submissionList = memoryStore.submissions;
  const leadList = memoryStore.leads;

  const landingObservedSessionIds = new Set(
    eventList
      .filter((e) => e.event_name === "landing_observed" && e.session_id)
      .map((e) => e.session_id as string)
  );
  const calcSessionIds = new Set(
    eventList.filter((e) => e.event_name === "calculator_used").map((e) => e.session_id)
  );
  const formStartedSessionIds = new Set(
    eventList.filter((e) => e.event_name === "form_started").map((e) => e.session_id)
  );
  const reportSessionIds = new Set(
    eventList.filter((e) => e.event_name === "report_opened").map((e) => e.session_id)
  );

  const convertedObservedSessions = new Set(
    submissionList
      .filter((s) => s.analytics_session_id && landingObservedSessionIds.has(s.analytics_session_id))
      .map((s) => s.analytics_session_id)
  );

  const utmBreakdown: Record<string, { sessions: number; submissions: number }> = {
    ad_a: { sessions: 0, submissions: 0 },
    ad_b: { sessions: 0, submissions: 0 },
    direct_other: { sessions: 0, submissions: 0 },
  };

  for (const sess of sessionList) {
    if (!landingObservedSessionIds.has(sess.id)) {
      continue;
    }
    const key = sess.utm_content === "ad_a" || sess.utm_content === "ad_b"
      ? sess.utm_content
      : "direct_other";
    utmBreakdown[key].sessions += 1;
    if (convertedObservedSessions.has(sess.id)) {
      utmBreakdown[key].submissions += 1;
    }
  }

  const cvr =
    landingObservedSessionIds.size > 0
      ? ((convertedObservedSessions.size / landingObservedSessionIds.size) * 100).toFixed(1)
      : "0.0";

  return {
    observedSessions: landingObservedSessionIds.size,
    calculatorUsed: calcSessionIds.size,
    formStarted: formStartedSessionIds.size,
    totalSubmissions: submissionList.length,
    uniqueLeads: leadList.length,
    reportsOpened: reportSessionIds.size,
    observedCvrPercent: `${cvr} %`,
    utmBreakdown,
  };
}

async function run() {
  console.log("=== ETF PŘEHLED - REPORT KONVERZNÍ VOŘONKY ===");
  console.log(`Vygenerováno: ${new Date().toISOString()}`);
  console.log("Poznámka: Bez jakýchkoliv osobních údajů (žádné e-maily ani IP adresy).\n");

  const stats = await generateFunnelReport();

  console.log(`1. Sledované relace se souhlasem (landing_observed):  ${stats.observedSessions}`);
  console.log(`2. Použití kalkulačky (calculator_used):             ${stats.calculatorUsed}`);
  console.log(`3. Zahájení vyplňování formuláře (form_started):      ${stats.formStarted}`);
  console.log(`4. Celkový počet odeslání formuláře (submissions):    ${stats.totalSubmissions}`);
  console.log(`5. Počet unikátních kontaktů (leads):                 ${stats.uniqueLeads}`);
  console.log(`6. Otevření reportu (report_opened):                  ${stats.reportsOpened}`);
  console.log(`----------------------------------------------------`);
  console.log(`Konverze pozorované skupiny (Observed CVR):          ${stats.observedCvrPercent}\n`);

  console.log("Rozpad podle reklamních variant (UTM):");
  for (const [k, v] of Object.entries(stats.utmBreakdown)) {
    console.log(` - ${k}: ${v.sessions} relací, ${v.submissions} konverzí`);
  }
}

if (process.argv[1]?.endsWith("funnel-report.ts") || process.argv[1]?.includes("funnel-report")) {
  run().catch(console.error);
}
