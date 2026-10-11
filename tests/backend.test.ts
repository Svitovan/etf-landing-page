import { describe, it, expect, beforeEach } from "vitest";
import { memoryStore } from "../src/lib/server/db";
import { saveLeadSubmission } from "../src/lib/server/lead-service";
import { checkRateLimit } from "../src/lib/server/rate-limit";
import {
  createAnalyticsSession,
  deactivateAnalyticsSession,
  recordAnalyticsEvent,
  isSessionValid,
} from "../src/lib/server/analytics";
import { generateFunnelReport } from "../scripts/funnel-report";
import { LeadSubmissionSchema } from "../src/lib/validation";

describe("T04: Server Payload & Email Validation", () => {
  it("rejects invalid email formats", () => {
    const res = LeadSubmissionSchema.safeParse({
      requestId: "11111111-1111-4111-8111-111111111111",
      email: "not-an-email",
      selectedEtfs: ["VOO"],
      positionValueCzk: 100000,
    });
    expect(res.success).toBe(false);
  });

  it("rejects non-allowlisted ETF tickers", () => {
    const res = LeadSubmissionSchema.safeParse({
      requestId: "11111111-1111-4111-8111-111111111111",
      email: "investor@example.cz",
      selectedEtfs: ["RANDOM_ETF"],
      positionValueCzk: 100000,
    });
    expect(res.success).toBe(false);
  });

  it("rejects honeypot submission when website field is filled", () => {
    const res = LeadSubmissionSchema.safeParse({
      requestId: "11111111-1111-4111-8111-111111111111",
      email: "bot@example.com",
      selectedEtfs: ["VOO"],
      positionValueCzk: 100000,
      website: "http://spam-link.com",
    });
    expect(res.success).toBe(false);
  });
});

describe("T05, T06, T08: Lead Service Persistence, Idempotency & Deduplication", () => {
  beforeEach(() => {
    memoryStore.reset();
  });

  it("T05: saves a valid lead and creates one lead and one submission", async () => {
    const reqId = "22222222-2222-4222-8222-222222222222";
    const result = await saveLeadSubmission(
      {
        requestId: reqId,
        email: "jan.novak@seznam.cz",
        selectedEtfs: ["VOO", "IVV", "SPY"],
        positionValueCzk: 100000,
        privacyVersion: "2026-10-11",
      },
      null
    );

    expect(result.success).toBe(true);
    expect(result.isNewLead).toBe(true);
    expect(result.isDuplicateRequest).toBe(false);
    expect(memoryStore.leads.length).toBe(1);
    expect(memoryStore.submissions.length).toBe(1);
    expect(memoryStore.leads[0].normalized_email).toBe("jan.novak@seznam.cz");
  });

  it("T06: duplicate requestId (double click / replay) does not duplicate submission", async () => {
    const reqId = "33333333-3333-4333-8333-333333333333";
    const payload = {
      requestId: reqId,
      email: "jan.novak@seznam.cz",
      selectedEtfs: ["VOO" as const],
      positionValueCzk: 100000,
      privacyVersion: "2026-10-11",
    };

    const first = await saveLeadSubmission(payload, null);
    const second = await saveLeadSubmission(payload, null);

    expect(first.success).toBe(true);
    expect(first.isDuplicateRequest).toBe(false);
    expect(second.success).toBe(true);
    expect(second.isDuplicateRequest).toBe(true);
    expect(second.submissionId).toBe(first.submissionId);
    expect(memoryStore.submissions.length).toBe(1);
  });

  it("T08: repeated submission with same email links to existing lead without increasing unique leads count", async () => {
    const payload1 = {
      requestId: "44444444-4444-4444-8444-444444444444",
      email: "eva@domena.cz",
      selectedEtfs: ["VOO" as const],
      positionValueCzk: 50000,
      privacyVersion: "2026-10-11",
    };

    const payload2 = {
      requestId: "55555555-5555-4555-8555-555555555555",
      email: "  EVA@domena.cz ", // different casing and whitespace
      selectedEtfs: ["SPY" as const],
      positionValueCzk: 250000,
      privacyVersion: "2026-10-11",
    };

    const res1 = await saveLeadSubmission(payload1, null);
    const res2 = await saveLeadSubmission(payload2, null);

    expect(res1.isNewLead).toBe(true);
    expect(res2.isNewLead).toBe(false);
    expect(res2.leadId).toBe(res1.leadId);
    expect(memoryStore.leads.length).toBe(1); // exactly 1 unique contact
    expect(memoryStore.submissions.length).toBe(2); // 2 submissions
  });
});

describe("T10, T11, T12, T13: Analytics Sessions and Consented Events", () => {
  beforeEach(() => {
    memoryStore.reset();
  });

  it("T11: creates session with active status and stores consented events with UTM", async () => {
    const { sessionId } = await createAnalyticsSession("2026-10-11", "ad_a");
    expect(await isSessionValid(sessionId)).toBe(true);

    const evOk = await recordAnalyticsEvent(sessionId, {
      eventId: "66666666-6666-4666-8666-666666666666",
      eventName: "calculator_used",
      properties: { selectedEtfs: "VOO,IVV" },
    });

    expect(evOk).toBe(true);
    expect(memoryStore.events.length).toBe(1);
    expect(memoryStore.events[0].event_name).toBe("calculator_used");
  });

  it("T12: consent revocation terminates active session and blocks further events", async () => {
    const { sessionId } = await createAnalyticsSession("2026-10-11", "ad_b");
    await deactivateAnalyticsSession(sessionId);

    expect(await isSessionValid(sessionId)).toBe(false);

    const evOk = await recordAnalyticsEvent(sessionId, {
      eventId: "77777777-7777-4777-8777-777777777777",
      eventName: "form_started",
    });

    expect(evOk).toBe(false);
    expect(memoryStore.events.length).toBe(0);
  });

  it("T13: event replay deduplicates identical eventId", async () => {
    const { sessionId } = await createAnalyticsSession("2026-10-11", null);
    const eventId = "88888888-8888-4888-8888-888888888888";

    await recordAnalyticsEvent(sessionId, {
      eventId,
      eventName: "comparison_viewed",
    });
    await recordAnalyticsEvent(sessionId, {
      eventId,
      eventName: "comparison_viewed",
    });

    expect(memoryStore.events.length).toBe(1);
  });
});

describe("Funnel Report Aggregation", () => {
  beforeEach(() => {
    memoryStore.reset();
  });

  it("computes accurate funnel metrics and CVR for observed sessions", async () => {
    // Session 1: converts
    const { sessionId: s1 } = await createAnalyticsSession("2026-10-11", "ad_a");
    await recordAnalyticsEvent(s1, {
      eventId: "99999999-9999-4999-8999-999999999991",
      eventName: "calculator_used",
    });
    await saveLeadSubmission(
      {
        requestId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        email: "lead1@test.cz",
        selectedEtfs: ["VOO"],
        positionValueCzk: 100000,
        privacyVersion: "2026-10-11",
      },
      s1
    );

    // Session 2: drops off after calculator
    const { sessionId: s2 } = await createAnalyticsSession("2026-10-11", "ad_b");
    await recordAnalyticsEvent(s2, {
      eventId: "99999999-9999-4999-8999-999999999992",
      eventName: "calculator_used",
    });

    const report = await generateFunnelReport();
    expect(report.observedSessions).toBe(2);
    expect(report.calculatorUsed).toBe(2);
    expect(report.totalSubmissions).toBe(1);
    expect(report.uniqueLeads).toBe(1);
    expect(report.observedCvrPercent).toBe("50.0 %");
    expect(report.utmBreakdown.ad_a.submissions).toBe(1);
    expect(report.utmBreakdown.ad_b.submissions).toBe(0);
  });
});

describe("T16: Server Rate Limiting", () => {
  beforeEach(() => {
    memoryStore.reset();
  });

  it("allows requests under the threshold and blocks excessive attempts", async () => {
    const testIp = "192.168.1.100";
    for (let i = 0; i < 10; i++) {
      const res = await checkRateLimit(testIp);
      expect(res.allowed).toBe(true);
    }

    const blockedRes = await checkRateLimit(testIp);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.retryAfterSeconds).toBeGreaterThan(0);
  });
});
