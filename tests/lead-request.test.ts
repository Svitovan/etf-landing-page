import { describe, it, expect, vi } from "vitest";
import { getLeadRequestAttempt, LeadRequestFields } from "../src/lib/lead-request";

const payload: LeadRequestFields = {
  email: "investor@example.com",
  selectedEtfs: ["VOO", "IVV"],
  positionValueCzk: 100_000,
  privacyVersion: "2026-10-11",
};

describe("Client submission attempt identity", () => {
  it("keeps the UUID on an identical retry after an uncertain network response", () => {
    const createId = vi.fn().mockReturnValueOnce("first-id").mockReturnValueOnce("second-id");
    const attempt = getLeadRequestAttempt(null, payload, createId);
    expect(getLeadRequestAttempt(attempt, payload, createId)).toBe(attempt);
    expect(createId).toHaveBeenCalledTimes(1);
  });

  it("does not change identity for case, whitespace or ticker order", () => {
    const attempt = getLeadRequestAttempt(null, payload, () => "first-id");
    expect(getLeadRequestAttempt(attempt, {
      ...payload, email: "  INVESTOR@example.com ", selectedEtfs: ["IVV", "VOO", "IVV"],
    }, () => "second-id")).toBe(attempt);
  });

  it.each([
    { email: "changed@example.com" },
    { selectedEtfs: ["SPY"] },
    { positionValueCzk: 250_000 },
    { privacyVersion: "2026-10-15" },
  ])("creates a new attempt when the user submits changed data: %j", (change) => {
    const attempt = getLeadRequestAttempt(null, payload, () => "first-id");
    expect(getLeadRequestAttempt(attempt, { ...payload, ...change }, () => "second-id").requestId)
      .toBe("second-id");
  });

  it("allows a fresh explicit attempt after clearing a server conflict", () => {
    const attempt = getLeadRequestAttempt(null, payload, () => "first-id");
    expect(getLeadRequestAttempt(null, payload, () => "second-id").requestId)
      .not.toBe(attempt.requestId);
  });
});
