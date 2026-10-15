import { describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("../src/lib/server/db", () => ({ getSupabaseServerClient: () => ({ rpc: state.rpc }) }));
import { markTestTraffic } from "../scripts/mark-test-traffic";

describe("admin test-traffic command", () => {
  it("defaults to preview and only commits with explicit apply", async () => {
    state.rpc.mockResolvedValueOnce({ data: { dryRun: true, submissionsMatched: 2, sessionsMatched: 1 }, error: null });
    await expect(markTestTraffic({ sessionId: "fixture-session" })).resolves.toMatchObject({ dryRun: true });
    expect(state.rpc).toHaveBeenLastCalledWith("mark_test_traffic", { p_request_id: null, p_session_id: "fixture-session", p_dry_run: true });
    state.rpc.mockResolvedValueOnce({ data: { dryRun: false, submissionsMatched: 1, sessionsMatched: 2 }, error: null });
    await expect(markTestTraffic({ requestId: "fixture-request", apply: true })).resolves.toMatchObject({ dryRun: false });
  });
  it("rejects missing/ambiguous targets", async () => {
    await expect(markTestTraffic({})).rejects.toThrow("INVALID_TEST_TRAFFIC_TARGET");
    await expect(markTestTraffic({ requestId: "a", sessionId: "b" })).rejects.toThrow("INVALID_TEST_TRAFFIC_TARGET");
  });
  it("does not accept provider errors or an invalid response as success", async () => {
    state.rpc.mockResolvedValueOnce({ error: { message: "private@example.com" }, data: null });
    await expect(markTestTraffic({ requestId: "fixture" })).rejects.toThrow("TEST_TRAFFIC_MARK_FAILED");
    state.rpc.mockResolvedValueOnce({ error: null, data: { dryRun: false, submissionsMatched: -1, sessionsMatched: 1 } });
    await expect(markTestTraffic({ requestId: "fixture", apply: true })).rejects.toThrow("TEST_TRAFFIC_MARK_FAILED");
  });
});
