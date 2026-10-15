import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), configured: true }));
vi.mock("../src/lib/server/db", async (original) => ({
  ...await original<typeof import("../src/lib/server/db")>(),
  getSupabaseServerClient: () => mocks.configured ? { rpc: mocks.rpc } : null,
}));
import { cleanupData } from "../scripts/cleanup-data";
import { memoryStore } from "../src/lib/server/db";

describe("Cleanup RPC failures, preview and scope", () => {
  beforeEach(() => { mocks.rpc.mockReset(); mocks.configured = true; memoryStore.reset(); });
  afterEach(() => vi.unstubAllEnvs());
  it("uses one atomic RPC and returns actual counts", async () => {
    const result = { dryRun: false, leadsDeleted: 1, submissionsDeleted: 2, eventsDeleted: 0, sessionsDeleted: 0, rateLimitsDeleted: 0 };
    mocks.rpc.mockResolvedValue({ data: result, error: null });
    expect(await cleanupData({ targetEmail: "  PERSON@example.com " })).toEqual(result);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenCalledWith("cleanup_project_data", {
      p_older_than_days: 30, p_dry_run: false, p_target_email: "person@example.com",
    });
  });
  it("rejects a database error without exposing its details or falling back", async () => {
    mocks.rpc.mockResolvedValue({ error: { message: "private@example.com" }, data: null });
    await expect(cleanupData()).rejects.toThrow("CLEANUP_DATABASE_FAILED");
    expect(memoryStore.leads).toHaveLength(0);
  });
  it.each([null, {}, { dryRun: false, leadsDeleted: -1 }])("rejects malformed counts: %j", async data => {
    mocks.rpc.mockResolvedValue({ data, error: null });
    await expect(cleanupData()).rejects.toThrow("CLEANUP_INVALID_RESPONSE");
  });
  it.each([0, -1, NaN, 1.5, 366])("rejects invalid retention %s before querying", async olderThanDays => {
    await expect(cleanupData({ olderThanDays })).rejects.toThrow("INVALID_CLEANUP_OPTIONS");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("rejects an empty targeted address instead of doing global cleanup", async () => {
    await expect(cleanupData({ targetEmail: " " })).rejects.toThrow("INVALID_CLEANUP_OPTIONS");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("does not silently use memory in production", async () => {
    mocks.configured = false; vi.stubEnv("NODE_ENV", "production");
    await expect(cleanupData()).rejects.toThrow("CLEANUP_STORAGE_NOT_CONFIGURED");
  });
  it("memory preview preserves data and targeted deletion leaves analytics alone", async () => {
    mocks.configured = false;
    const old = new Date(Date.now() - 35 * 86400000).toISOString();
    memoryStore.leads.push({ id: "one", email: "person@example.com", normalized_email: "person@example.com", created_at: old });
    memoryStore.sessions.push({ id: "session", consent_version: "test", utm_content: null, is_active: false, created_at: old, expires_at: old });
    const before = structuredClone(memoryStore.leads);
    expect((await cleanupData({ dryRun: true })).leadsDeleted).toBe(1);
    expect(memoryStore.leads).toEqual(before);
    expect((await cleanupData({ targetEmail: "person@example.com" })).sessionsDeleted).toBe(0);
    expect(memoryStore.sessions).toHaveLength(1);
    expect(memoryStore.leads).toHaveLength(0);
  });
});
