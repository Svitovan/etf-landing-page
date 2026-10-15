import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("../src/lib/server/db", async (importOriginal) => ({
  ...await importOriginal<typeof import("../src/lib/server/db")>(),
  getSupabaseServerClient: () => ({ rpc: mocks.rpc }),
}));

import { saveLeadSubmission } from "../src/lib/server/lead-service";
import { LeadRequestConflictError } from "../src/lib/server/lead-errors";

const payload = {
  requestId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  email: "  INVESTOR@example.com ",
  selectedEtfs: ["VOO", "IVV", "VOO"] as ("VOO" | "IVV" | "SPY")[],
  positionValueCzk: 100_000,
  privacyVersion: "2026-10-11",
};

describe("Database RPC result handling", () => {
  beforeEach(() => mocks.rpc.mockReset());
  afterEach(() => vi.restoreAllMocks());

  it("maps PT409 to a typed conflict without logging provider details", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "PT409", message: "IDEMPOTENCY_CONFLICT" } });
    await expect(saveLeadSubmission(payload, null)).rejects.toBeInstanceOf(LeadRequestConflictError);
    expect(log).not.toHaveBeenCalled();
  });

  it("sends canonical ticker values to RPC and preserves matching retry results", async () => {
    mocks.rpc.mockResolvedValue({ error: null, data: {
      success: true, lead_id: "lead-id", submission_id: "submission-id",
      position_value_czk: 100000, selected_etfs: ["IVV", "VOO"],
      is_new_lead: false, is_duplicate_request: true,
    } });
    const result = await saveLeadSubmission(payload, null);
    expect(mocks.rpc).toHaveBeenCalledWith("submit_lead", expect.objectContaining({
      p_normalized_email: "investor@example.com", p_selected_etfs: ["IVV", "VOO"],
    }));
    expect(result).toMatchObject({ success: true, isDuplicateRequest: true, reportUrl: "/report?amount=100000&etfs=IVV,VOO" });
  });

  it("keeps unrelated database failures as failures, without logging row values", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.rpc.mockResolvedValue({ data: null, error: { code: "XX000", message: "sensitive provider detail" } });
    await expect(saveLeadSubmission(payload, null)).rejects.toThrow("DATABASE_SAVE_FAILED");
    expect(log).toHaveBeenCalledWith("Database submit_lead RPC failed:", "XX000");
  });
});
