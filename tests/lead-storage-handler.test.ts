import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("../src/lib/server/db", async (importOriginal) => ({
  ...await importOriginal<typeof import("../src/lib/server/db")>(),
  getSupabaseServerClient: () => ({ rpc: mocks.rpc }),
}));
vi.mock("../src/lib/server/rate-limit", () => ({
  checkRateLimit: async () => ({ allowed: true, retryAfterSeconds: 0 }),
}));

import { memoryStore } from "../src/lib/server/db";
import { POST } from "../src/app/api/leads/route";

describe("T07: storage failure through the real lead handler (mocked provider)", () => {
  beforeEach(() => {
    memoryStore.reset();
    mocks.rpc.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it.each([
    { data: null, error: { code: "XX000", message: "private-row@example.com" } },
    { data: null, error: null },
    { data: { success: false }, error: null },
  ])("returns 503 without a report, PII or a memory fallback: %j", async (result) => {
    mocks.rpc.mockResolvedValue(result);
    const response = await POST(new NextRequest("http://localhost:3000/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3000" },
      body: JSON.stringify({
        requestId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        email: "investor@example.com",
        selectedEtfs: ["VOO"], positionValueCzk: 100000, privacyVersion: "2026-10-11",
      }),
    }));
    expect(mocks.rpc).toHaveBeenCalledWith("submit_lead", expect.any(Object));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.reportUrl).toBeUndefined();
    expect(JSON.stringify(body)).not.toMatch(/private-row|investor@|stack|XX000/);
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("private-row@example.com");
    expect(memoryStore.leads).toHaveLength(0);
    expect(memoryStore.submissions).toHaveLength(0);
  });
});
