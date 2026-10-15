import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

if (!process.env.npm_execpath) throw new Error("Run through npm run audit:dependencies");
const result = spawnSync(process.execPath, [process.env.npm_execpath, "audit", "--json"], { encoding: "utf8" });
if (result.error) throw result.error;
const report = JSON.parse(result.stdout);
if (report.error || !report.metadata || ![0, 1].includes(result.status)) throw new Error("Dependency audit unavailable");
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const knownChain = new Set(["@next/eslint-plugin-next", "braces", "eslint-config-next", "fast-glob", "micromatch"]);
const reviewedAdvisory = "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm";
const reviewExpired = new Date() >= new Date("2026-11-15T00:00:00Z");
const findings = Object.entries(report.vulnerabilities || {}).map(([name, finding]) => {
  const reviewedDevelopmentOnly = !reviewExpired && knownChain.has(name)
    && finding.nodes.length > 0 && finding.nodes.every(path => lock.packages[path]?.dev === true)
    && finding.via.length > 0 && finding.via.every(item => typeof item === "string" ? knownChain.has(item) : item.url === reviewedAdvisory);
  return { name, severity: finding.severity, reviewedDevelopmentOnly };
});
console.log(JSON.stringify({ totals: report.metadata.vulnerabilities, reviewedAdvisory, reviewBefore: "2026-11-15", findings }, null, 2));
if (findings.some(item => !item.reviewedDevelopmentOnly)) process.exitCode = 1;
