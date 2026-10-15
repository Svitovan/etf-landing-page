import { createServer } from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Report and cleanup CLI exit status with a local HTTP provider", () => {
  it.each([
    { script: "funnel-report", fail: false }, { script: "funnel-report", fail: true },
    { script: "cleanup-data", fail: false }, { script: "cleanup-data", fail: true },
  ])("$script exits correctly when provider failure is $fail", async ({ script, fail }) => {
    let requests = 0;
    const server = createServer((_request, response) => {
      requests++;
      response.writeHead(fail ? 503 : 200, { "content-type": "application/json" });
      response.end(JSON.stringify(fail
        ? { code: "XX000", message: "private-row@example.com" }
        : script === "cleanup-data"
          ? { dryRun: false, leadsDeleted: 0, submissionsDeleted: 0, eventsDeleted: 0, sessionsDeleted: 0, rateLimitsDeleted: 0 }
          : []));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Missing test port");
      const result = await new Promise<{ code: number | null; output: string }>((resolve, reject) => {
        const child = spawn(process.execPath, ["--import", "tsx", path.resolve(`scripts/${script}.ts`)], {
          cwd: process.cwd(),
          env: {
            ...process.env,
            SUPABASE_URL: `http://127.0.0.1:${address.port}`,
            SUPABASE_SECRET_KEY: "sb_secret_local_test_only",
            NODE_ENV: "test",
          },
          timeout: 15000,
        });
        let output = "";
        child.stdout.on("data", (data) => { output += data; });
        child.stderr.on("data", (data) => { output += data; });
        child.on("error", reject);
        child.on("close", (code) => resolve({ code, output }));
      });
      expect(result.code, result.output).toBe(fail ? 1 : 0);
      expect(requests).toBeGreaterThan(0);
      expect(result.output).not.toContain("private-row@example.com");
      if (fail) {
        expect(result.output).toContain(script === "cleanup-data" ? "Cleanup failed" : "Funnel report failed");
        expect(result.output).not.toContain("Observed CVR");
        expect(result.output).not.toContain("Cleanup committed");
      } else {
        expect(requests).toBe(script === "cleanup-data" ? 1 : 3);
        expect(result.output).toContain(script === "cleanup-data" ? "Cleanup committed" : "Observed CVR");
        if (script === "funnel-report") expect(result.output).toContain("N/A");
      }
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  }, 20000);
});
