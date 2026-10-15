import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("dependency audit gate", () => {
  it.each([
    { name: "allows the reviewed dev-only advisory", dev: true, unknown: false, error: false, status: 0 },
    { name: "rejects the same advisory in production", dev: false, unknown: false, error: false, status: 1 },
    { name: "rejects a new advisory", dev: true, unknown: true, error: false, status: 1 },
    { name: "does not treat unavailable audit as clean", dev: true, unknown: false, error: true, status: 1 },
  ])("$name", ({ dev, unknown, error, status }) => {
    const root = resolve("tmp");
    mkdirSync(root, { recursive: true });
    const cwd = mkdtempSync(join(root, "audit-gate-"));
    try {
      const report = error ? { error: { code: "TEST_UNAVAILABLE" } } : {
        metadata: { vulnerabilities: { high: 1, total: 1 } },
        vulnerabilities: { braces: {
          severity: "high", nodes: ["node_modules/braces"],
          via: [{ url: unknown ? "https://example.com/new-advisory" : "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm" }],
        } },
      };
      const provider = join(cwd, "npm-fixture.cjs");
      writeFileSync(provider, `console.log(${JSON.stringify(JSON.stringify(report))}); process.exitCode=1;`);
      writeFileSync(join(cwd, "package-lock.json"), JSON.stringify({ packages: { "node_modules/braces": { dev } } }));
      const result = spawnSync(process.execPath, [resolve("scripts/audit-dependencies.mjs")], {
        cwd, encoding: "utf8", env: {
          ...Object.fromEntries(Object.entries(process.env).filter(([key]) => key.toLowerCase() !== "npm_execpath")),
          NODE_ENV: process.env.NODE_ENV,
          npm_execpath: provider,
        },
      });
      expect(result.status, result.stdout + result.stderr).toBe(status);
      if (error) expect(result.stderr).toContain("Dependency audit unavailable");
    } finally {
      if (dirname(resolve(cwd)) !== root) throw new Error("Unsafe fixture cleanup path");
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
