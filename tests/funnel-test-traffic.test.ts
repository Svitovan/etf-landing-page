import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { aggregateFunnel, generateFunnelReport } from "../scripts/funnel-report";
import { memoryStore } from "../src/lib/server/db";
import { saveLeadSubmission } from "../src/lib/server/lead-service";
import { createAnalyticsSession, recordAnalyticsEvent } from "../src/lib/server/analytics";
import { isDemoEmail } from "../src/lib/server/test-traffic";

const sessions = ["a", "b", "demo"].map(id => ({ id, utm_content: "ad_b", is_test: id === "demo" }));
const events = sessions.flatMap(s => ["landing_observed", "calculator_used", "form_started", "report_opened"].map(event_name => ({ session_id: s.id, event_name })));
const submissions = [
  { request_id: "real", lead_id: "real-lead", analytics_session_id: "a", is_test: false },
  { request_id: "test", lead_id: "test-lead", analytics_session_id: "demo", is_test: true },
];

describe("non-test funnel cohort", () => {
  it("removes test conversions AND denominator/events/UTM without changing real CVR", () => {
    const stats = aggregateFunnel(sessions, events, submissions);
    expect(stats).toMatchObject({ scope: "non_test_only", observedSessions: 2, totalSubmissions: 1,
      uniqueLeads: 1, calculatorUsed: 2, formStarted: 2, reportsOpened: 2,
      observedCvrPercent: "50.0 %", excludedTestSessions: 1, excludedTestSubmissions: 1 });
    expect(stats.utmBreakdown.ad_b).toEqual({ sessions: 2, submissions: 1 });
  });
  it("does not present an all-demo dataset as measured marketing conversion", () => {
    const stats = aggregateFunnel(sessions.slice(2), events, submissions.slice(1));
    expect(stats.observedSessions).toBe(0);
    expect(stats.totalSubmissions).toBe(0);
    expect(stats.observedCvrPercent).toContain("N/A");
  });
  it("excludes a test without consent and preserves the other visitors", () => {
    const stats = aggregateFunnel(sessions.slice(0, 2), events, [{ ...submissions[1], analytics_session_id: null }]);
    expect(stats.observedSessions).toBe(2);
    expect(stats.totalSubmissions).toBe(0);
    expect(stats.uniqueLeads).toBe(0);
  });
  it("keeps a genuine conversion when the same lead also has a test submission", () => {
    const stats = aggregateFunnel(sessions, events, [submissions[0], { ...submissions[1], lead_id: "real-lead" }]);
    expect(stats.uniqueLeads).toBe(1);
    expect(stats.totalSubmissions).toBe(1);
  });
  it("excludes split sessions via request ID, including a late attempt", () => {
    const stats = aggregateFunnel(sessions, [...events, {
      session_id: "a", event_name: "form_submit_attempted", properties: { requestId: "test" },
    }], submissions);
    expect(stats.observedSessions).toBe(1);
    expect(stats.totalSubmissions).toBe(0);
    expect(stats.excludedTestSessions).toBe(2);
  });
  it("excludes older submissions when their session was manually classified", () => {
    const stats = aggregateFunnel(sessions, events, [{ ...submissions[1], is_test: false }]);
    expect(stats.excludedTestSubmissions).toBe(1);
    expect(stats.uniqueLeads).toBe(0);
  });
  it.each(["a@example.com", "a@example.net", "a@example.org", "a@local.test", "a@local.invalid"])("recognizes reserved domain %s", email => {
    expect(isDemoEmail(email)).toBe(true);
  });
  it("does not infer tests from a name prefix or a similar real domain", () => {
    expect(isDemoEmail("qa@real-domain.cz")).toBe(false);
    expect(isDemoEmail("a@example.com.cz")).toBe(false);
  });
});

describe("memory fallback has the same automatic classification", () => {
  beforeEach(() => { memoryStore.reset(); vi.stubEnv("SUPABASE_URL", ""); vi.stubEnv("SUPABASE_SECRET_KEY", ""); });
  afterEach(() => { vi.unstubAllEnvs(); });
  it("classifies reserved submissions, their session and a later split-session attempt", async () => {
    const { sessionId } = await createAnalyticsSession("2026-10-11", "ad_a");
    await recordAnalyticsEvent(sessionId, { eventId: crypto.randomUUID(), eventName: "landing_observed" });
    const requestId = crypto.randomUUID();
    await saveLeadSubmission({ requestId, email: "demo@example.com", selectedEtfs: ["IVV"], positionValueCzk: 250000, privacyVersion: "2026-10-11" }, sessionId);
    expect(memoryStore.submissions[0].is_test).toBe(true);
    expect(memoryStore.sessions[0].is_test).toBe(true);
    const split = await createAnalyticsSession("2026-10-11", "ad_a");
    await recordAnalyticsEvent(split.sessionId, { eventId: crypto.randomUUID(), eventName: "form_submit_attempted", properties: { requestId } });
    expect(memoryStore.sessions[1].is_test).toBe(true);
    expect((await generateFunnelReport()).totalSubmissions).toBe(0);
  });
});
