import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";

const root = resolve("tmp");
const script = resolve("scripts/check-secret-exposure.mjs");
function fixture(run: (cwd: string, secret: string) => void) {
  mkdirSync(root, { recursive: true });
  const cwd = mkdtempSync(join(root, "secret-check-"));
  try {
    execFileSync("git", ["init", "--quiet"], { cwd });
    const secret = `fixture-only-${randomUUID()}`;
    writeFileSync(join(cwd, ".env"), `TEST_SECRET=${secret}\n`);
    writeFileSync(join(cwd, ".gitignore"), ".env\n.next/\n");
    run(cwd, secret);
  } finally {
    if (dirname(resolve(cwd)) !== root) throw new Error("Unsafe fixture cleanup path");
    rmSync(cwd, { recursive: true, force: true });
  }
}
function commit(cwd: string) {
  execFileSync("git", ["add", "."], { cwd });
  execFileSync("git", ["-c", "user.name=QA Fixture", "-c", "user.email=qa@example.com", "commit", "--quiet", "-m", "fixture"], { cwd });
}

describe("secret exposure CLI without secret output", () => {
  it("detects an old Git blob even when the current tracked file is clean", () => fixture((cwd, secret) => {
    writeFileSync(join(cwd, "sample.txt"), secret);
    commit(cwd);
    writeFileSync(join(cwd, "sample.txt"), "clean");
    commit(cwd);
    const result = spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("git-blob:");
    expect(result.stdout + result.stderr).not.toContain(secret);
  }));

  it("detects base64 exposure in a client asset while keeping values private", () => fixture((cwd, secret) => {
    writeFileSync(join(cwd, "sample.txt"), "clean");
    commit(cwd);
    mkdirSync(join(cwd, ".next/static"), { recursive: true });
    const encoded = Buffer.from(secret).toString("base64");
    writeFileSync(join(cwd, ".next/static/client.js"), encoded);
    const result = spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("client.js");
    expect(result.stdout + result.stderr).not.toContain(secret);
    expect(result.stdout + result.stderr).not.toContain(encoded);
  }));
});
