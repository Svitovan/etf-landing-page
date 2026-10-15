import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.stubGlobal("window", { location: { search: "" } });
  vi.stubGlobal("localStorage", { getItem: () => "granted" });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("lead submission analytics coordination", () => {
  it("waits for the consent session and sends the attempt before releasing the lead", async () => {
    let completeSession!: (response: unknown) => void;
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise(resolve => { completeSession = resolve; }))
      .mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    const client = await import("../src/lib/analytics-client");
    const session = client.initAnalyticsSession();
    let ready = false;
    const attempt = client.trackLeadSubmissionAttempt("test-request").then(() => { ready = true; });
    await vi.advanceTimersByTimeAsync(100);
    expect(ready).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    completeSession({ ok: true });
    await session;
    await attempt;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      eventName: "form_submit_attempted", properties: { requestId: "test-request" },
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reinitializes an expired session before releasing the lead", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ status: 403 })
      .mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({ status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    const client = await import("../src/lib/analytics-client");
    await client.trackLeadSubmissionAttempt("test-request");
    expect(fetchMock.mock.calls.map(call => call[0])).toEqual([
      "/api/events", "/api/analytics-session", "/api/events",
    ]);
  });

  it("does not track or initialize without consent", async () => {
    vi.stubGlobal("localStorage", { getItem: () => "denied" });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const client = await import("../src/lib/analytics-client");
    await client.trackLeadSubmissionAttempt("test-request");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("bounds analytics waiting and tolerates a failed request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementationOnce(() => new Promise(() => {}))
      .mockRejectedValueOnce(new Error("offline")));
    const client = await import("../src/lib/analytics-client");
    const waiting = client.trackLeadSubmissionAttempt("slow-request");
    await vi.advanceTimersByTimeAsync(2000);
    await waiting;
    await client.trackLeadSubmissionAttempt("offline-request");
    expect(vi.getTimerCount()).toBe(0);
  });
});
