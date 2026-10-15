import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { memoryStore } from "../src/lib/server/db";
import { saveLeadSubmission } from "../src/lib/server/lead-service";
import { LeadRequestConflictError } from "../src/lib/server/lead-errors";
import { checkRateLimit } from "../src/lib/server/rate-limit";
import {
  createAnalyticsSession,
  deactivateAnalyticsSession,
  recordAnalyticsEvent,
  isSessionValid,
} from "../src/lib/server/analytics";
import { generateFunnelReport } from "../scripts/funnel-report";
import fs from "node:fs";
import path from "node:path";
import { parseCzkInput, DEFAULT_POSITION_CZK } from "../src/lib/calculations";
import { cleanupData } from "../scripts/cleanup-data";
import { LeadSubmissionSchema, AnalyticsEventSchema } from "../src/lib/validation";
import { NextRequest } from "next/server";
import { POST as eventsPost } from "../src/app/api/events/route";
import { POST as leadsPost } from "../src/app/api/leads/route";

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
    // Session 1: observed and converts
    const { sessionId: s1 } = await createAnalyticsSession("2026-10-11", "ad_a");
    await recordAnalyticsEvent(s1, {
      eventId: "99999999-9999-4999-8999-999999999990",
      eventName: "landing_observed",
    });
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

    // Session 2: observed and drops off after calculator
    const { sessionId: s2 } = await createAnalyticsSession("2026-10-11", "ad_b");
    await recordAnalyticsEvent(s2, {
      eventId: "99999999-9999-4999-8999-999999999992",
      eventName: "landing_observed",
    });
    await recordAnalyticsEvent(s2, {
      eventId: "99999999-9999-4999-8999-999999999993",
      eventName: "calculator_used",
    });

    // Session 3: unobserved session (no landing_observed, e.g. bot or bounced before consent)
    const { sessionId: s3 } = await createAnalyticsSession("2026-10-11", "ad_b");
    // No landing_observed recorded for s3

    const report = await generateFunnelReport();
    expect(report.observedSessions).toBe(2);
    expect(report.calculatorUsed).toBe(2);
    expect(report.totalSubmissions).toBe(1);
    expect(report.uniqueLeads).toBe(1);
    expect(report.observedCvrPercent).toBe("50.0 %");
    expect(report.utmBreakdown.ad_a.submissions).toBe(1);
    expect(report.utmBreakdown.ad_b.submissions).toBe(0);
    expect(report.utmBreakdown.ad_b.sessions).toBe(1); // s3 excluded because not observed
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

describe("T07: Storage Error Handling & Graceful Recovery", () => {
  it("rejects saving lead when required email or fields are missing", async () => {
    await expect(
      saveLeadSubmission(
        {
          requestId: "corrupt",
          email: "",
          selectedEtfs: [] as any,
          positionValueCzk: -100,
          privacyVersion: "2026-10-11",
        },
        null
      )
    ).rejects.toThrow("INVALID_PAYLOAD");
  });
});

describe("T09: Safe Report Parameter Parsing", () => {
  it("safely falls back to default 100 000 Kč on invalid or missing amount parameter", () => {
    // Invalid string
    const resInvalid = parseCzkInput("invalid-amount");
    expect(resInvalid.value).toBeNull();
    const fallbackAmount = resInvalid.value ?? DEFAULT_POSITION_CZK;
    expect(fallbackAmount).toBe(100_000);

    // Negative string
    const resNegative = parseCzkInput("-50000");
    expect(resNegative.value).toBeNull();

    // Extreme number exceeding bounds
    const resExtreme = parseCzkInput("99999999999");
    expect(resExtreme.value).toBeNull();
  });
});

describe("T10: Pre-Consent Analytics Isolation", () => {
  beforeEach(() => {
    memoryStore.reset();
  });

  it("rejects analytics events when session is null or invalid", async () => {
    const ok = await recordAnalyticsEvent("non-existent-session", {
      eventId: "00000000-0000-4000-8000-000000000000",
      eventName: "calculator_used",
    });
    expect(ok).toBe(false);
    expect(memoryStore.events.length).toBe(0);
  });
});

describe("T14: Prevention of Browser lead_saved Spoofing (HTTP Endpoint)", () => {
  it("rejects lead_saved event with HTTP 400 when sent to /api/events endpoint", async () => {
    const req = new NextRequest("http://localhost:3000/api/events", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "etf_session=any-session-id",
      },
      body: JSON.stringify({
        eventId: "12345678-1234-4234-8234-123456789012",
        eventName: "lead_saved",
      }),
    });

    const res = await eventsPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("lead_saved");
  });
});

describe("T20: Cross-Origin and Untrusted Origin Rejection (B03)", () => {
  it("rejects POST to /api/leads with 403 when Origin header is untrusted", async () => {
    const req = new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://untrusted.attacker.com",
      },
      body: JSON.stringify({
        requestId: "12345678-1234-4234-8234-123456789012",
        email: "attacker@example.com",
        selectedEtfs: ["VOO"],
        positionValueCzk: 100000,
      }),
    });

    const res = await leadsPost(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Neplatný původ požadavku.");
  });
});

describe("T15: Supabase Migration Row Level Security (RLS)", () => {
  it("verifies initial SQL migration enables RLS on all 5 tables", () => {
    const sql = fs.readFileSync(
      path.join(__dirname, "../supabase/migrations/20261011000000_initial_schema.sql"),
      "utf-8"
    );

    const requiredTables = [
      "leads",
      "lead_submissions",
      "analytics_sessions",
      "analytics_events",
      "rate_limit_buckets",
    ];

    for (const table of requiredTables) {
      expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });
});

describe("Data Retention & Cleanup (cleanup-data.ts)", () => {
  beforeEach(() => {
    memoryStore.reset();
  });

  it("removes expired submissions and leads older than threshold", async () => {

    // Add old lead
    const oldDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
    memoryStore.leads.push({
      id: "old-lead-id",
      email: "old@example.cz",
      normalized_email: "old@example.cz",
      created_at: oldDate,
    });
    memoryStore.submissions.push({
      id: "old-sub-id",
      request_id: "old-req-id",
      lead_id: "old-lead-id",
      selected_etfs: ["VOO"],
      position_value_czk: 100000,
      privacy_version: "2026-10-11",
      dataset_version: "2026-10-11",
      analytics_session_id: null,
      created_at: oldDate,
    });

    // Add recent lead
    const recentDate = new Date().toISOString();
    memoryStore.leads.push({
      id: "new-lead-id",
      email: "new@example.cz",
      normalized_email: "new@example.cz",
      created_at: recentDate,
    });
    memoryStore.submissions.push({
      id: "new-sub-id",
      request_id: "new-req-id",
      lead_id: "new-lead-id",
      selected_etfs: ["VOO"],
      position_value_czk: 100000,
      privacy_version: "2026-10-11",
      dataset_version: "2026-10-11",
      analytics_session_id: null,
      created_at: recentDate,
    });

    // Run dry run first
    const dryRunRes = await cleanupData({ dryRun: true, olderThanDays: 30 });
    expect(dryRunRes.leadsDeleted).toBe(1);
    expect(dryRunRes.submissionsDeleted).toBe(1);
    expect(memoryStore.leads.length).toBe(2); // not deleted in dry run

    // Run real cleanup
    const liveRes = await cleanupData({ dryRun: false, olderThanDays: 30 });
    expect(liveRes.leadsDeleted).toBe(1);
    expect(liveRes.submissionsDeleted).toBe(1);
    expect(memoryStore.leads.length).toBe(1);
    expect(memoryStore.leads[0].id).toBe("new-lead-id");
  });
});

describe("T17: Strict Analytics Event Properties & PII Rejection (A06)", () => {
  it("rejects analytics events containing PII properties like email or rawUrl", () => {
    const invalidEmailProp = AnalyticsEventSchema.safeParse({
      eventId: "33333333-3333-4333-8333-333333333333",
      eventName: "landing_observed",
      properties: {
        email: "leak@example.com",
      },
    });
    expect(invalidEmailProp.success).toBe(false);

    const invalidUrlProp = AnalyticsEventSchema.safeParse({
      eventId: "33333333-3333-4333-8333-333333333333",
      eventName: "landing_observed",
      properties: {
        rawUrl: "https://example.com/?leak=1",
      },
    });
    expect(invalidUrlProp.success).toBe(false);
  });

  it("accepts valid, allowlisted event properties", () => {
    const valid = AnalyticsEventSchema.safeParse({
      eventId: "44444444-4444-4444-8444-444444444444",
      eventName: "lead_cta_clicked",
      properties: {
        ctaLocation: "hero",
      },
    });
    expect(valid.success).toBe(true);
  });
});

describe("T18: Retry identity and changed-payload conflicts", () => {
  const payload = {
    requestId: "55555555-5555-4555-8555-555555555555",
    email: "investor@example.com",
    selectedEtfs: ["VOO", "IVV"] as ("VOO" | "IVV" | "SPY")[],
    positionValueCzk: 100_000,
    privacyVersion: "2026-10-11",
  };

  beforeEach(async () => {
    memoryStore.reset();
    await saveLeadSubmission(payload, null);
  });

  afterEach(() => vi.unstubAllEnvs());

  it.each([
    { email: "other@example.com" },
    { selectedEtfs: ["SPY"] as ("VOO" | "IVV" | "SPY")[] },
    { positionValueCzk: 500_000 },
    { privacyVersion: "2026-10-15" },
  ])("rejects a changed field without changing stored records: %j", async (change) => {
    const before = structuredClone({ leads: memoryStore.leads, submissions: memoryStore.submissions });
    await expect(saveLeadSubmission({ ...payload, ...change }, null))
      .rejects.toBeInstanceOf(LeadRequestConflictError);
    expect({ leads: memoryStore.leads, submissions: memoryStore.submissions }).toEqual(before);
  });

  it("accepts email normalization and reordered/duplicate tickers as the same request", async () => {
    const result = await saveLeadSubmission({
      ...payload,
      email: "  INVESTOR@example.com  ",
      selectedEtfs: ["IVV", "VOO", "IVV"],
    }, "a-different-analytics-session");
    expect(result.isDuplicateRequest).toBe(true);
    expect(result.submissionId).toBe(memoryStore.submissions[0].id);
    expect(memoryStore.submissions).toHaveLength(1);
    expect(memoryStore.submissions[0].analytics_session_id).toBeNull();
  });

  it("rejects a different dataset version under the same requestId", async () => {
    const savedVersion = memoryStore.submissions[0].dataset_version;
    vi.stubEnv("DATASET_VERSION", "another-dataset-version");
    await expect(saveLeadSubmission(payload, null)).rejects.toBeInstanceOf(LeadRequestConflictError);
    expect(memoryStore.submissions[0].dataset_version).toBe(savedVersion);
  });

  it("returns HTTP 409 without PII and still permits a matching retry afterward", async () => {
    const request = (body: typeof payload) => new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const conflict = await leadsPost(request({ ...payload, email: "other@example.com" }));
    expect(conflict.status).toBe(409);
    const body = await conflict.json();
    expect(body).toMatchObject({ success: false, errorCode: "IDEMPOTENCY_CONFLICT" });
    expect(JSON.stringify(body)).not.toContain(payload.email);
    expect(JSON.stringify(body)).not.toContain("other@example.com");
    expect(body.reportUrl).toBeUndefined();

    const retry = await leadsPost(request(payload));
    expect(retry.status).toBe(200);
    expect(await retry.json()).toMatchObject({ success: true, isDuplicateRequest: true });
    expect(memoryStore.submissions).toHaveLength(1);
  });
});

describe("T19: Production Storage Guard (A01)", () => {
  it("throws error in production when permanent database is not configured", async () => {
    const originalEnv = process.env.NODE_ENV;
    const env = process.env as Record<string, string | undefined>;
    try {
      env.NODE_ENV = "production";

      await expect(
        saveLeadSubmission(
          {
            requestId: "66666666-6666-4666-8666-666666666666",
            email: "prod-test@example.cz",
            selectedEtfs: ["VOO"],
            positionValueCzk: 100_000,
            privacyVersion: "2026-10-11",
          },
          null
        )
      ).rejects.toThrow("PRODUCTION_STORAGE_NOT_CONFIGURED");
    } finally {
      env.NODE_ENV = originalEnv;
    }
  });
});


