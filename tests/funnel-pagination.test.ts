import { createServer } from "node:http";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ client: null as ReturnType<typeof createClient> | null }));
vi.mock("../src/lib/server/db", () => ({ getSupabaseServerClient: () => state.client, memoryStore: {} }));
import { generateFunnelReport } from "../scripts/funnel-report";

describe("funnel reads every REST page", () => {
  it("excludes tests beyond the first 1000 rows", async () => {
    const sessionRows = Array.from({ length: 1050 }, (_, i) => ({ id: `session-${i}`, utm_content: "ad_b", is_test: i >= 1000 }));
    const eventRows = sessionRows.map(s => ({ session_id: s.id, event_name: "landing_observed", properties: {} }));
    let requests = 0;
    const server = createServer((request, response) => {
      requests++;
      const url = new URL(request.url!, "http://localhost");
      const rows = url.pathname.endsWith("analytics_sessions") ? sessionRows : url.pathname.endsWith("analytics_events") ? eventRows : [];
      const offset = Number(url.searchParams.get("offset") || 0);
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(rows.slice(offset, offset + 1000)));
    });
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("No fixture port");
      state.client = createClient(`http://127.0.0.1:${address.port}`, "sb_secret_fixture_only", { auth: { persistSession: false } });
      const report = await generateFunnelReport();
      expect(report.observedSessions).toBe(1000);
      expect(report.excludedTestSessions).toBe(50);
      expect(report.utmBreakdown.ad_b.sessions).toBe(1000);
      expect(requests).toBe(5);
    } finally {
      state.client = null;
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
  });
});
