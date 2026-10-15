import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// Read-only check of the proposed retained tree, not a cleanup command.
const scope = JSON.parse(readFileSync("docs/submission-scope.json", "utf8"));
const excluded = [...scope.removeBeforeSubmission, ...scope.optionalRemoval];
const records = new Set(scope.originalLanguageRecords);
const matches = (file, entry) => entry.endsWith("/") ? file.startsWith(entry) : file === entry;
const isExcluded = file => excluded.some(entry => matches(file, entry));
const names = [...new Set(execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
  encoding: "utf8", maxBuffer: 20 * 1024 * 1024,
}).split("\0").filter(Boolean))];
const failures = [];
if (scope.recommendedCleanupCompleted) {
  for (const file of scope.removeBeforeSubmission) {
    if (existsSync(file)) failures.push(`Recommended cleanup file still present: ${file}`);
  }
}
let checked = 0;
let links = 0;
for (const file of records) if (!existsSync(file)) failures.push(`Missing original AI record: ${file}`);
for (const file of names) {
  if (!existsSync(file) || isExcluded(file) || records.has(file)) continue;
  // Binary PDF/image content is not a plain-text language audit.
  if (!/\.(?:md|json|jsonl|[cm]?js|tsx?|css|html|ya?ml|toml|sql|txt)$/.test(file)
    && !/^\.(?:env\.example|gitignore|gitleaksignore|gitattributes|node-version)$/.test(file)) continue;
  checked++;
  const text = readFileSync(file, "utf8");
  if (/\p{Script=Cyrillic}/u.test(text)) failures.push(`Cyrillic outside historical AI records: ${file}`);
  if (!file.endsWith(".md")) continue;
  for (const match of text.matchAll(/!?\[[^\]\r\n]*\]\(([^)\r\n]+)\)/g)) {
    const target = match[1].trim().replace(/^<([^>]+)>$/, "$1");
    if (/^(?:https?:|mailto:|#)/i.test(target)) continue;
    if (/^file:/i.test(target)) { failures.push(`Nonportable file link: ${file}`); continue; }
    let local;
    try { local = decodeURIComponent(target.split(/[?#]/)[0]); }
    catch { failures.push(`Invalid link encoding: ${file}`); continue; }
    const absolute = path.resolve(path.dirname(file), local);
    const relative = path.relative(process.cwd(), absolute).split(path.sep).join("/");
    links++;
    if (!existsSync(absolute) || isExcluded(relative)) failures.push(`Missing or cleanup-dependent link: ${file} -> ${target}`);
  }
}
console.log(`Proposed retained content: ${checked} text files, ${links} local Markdown links checked.`);
console.log(`Original-language AI records: ${records.size}. Cleanup candidates still present: ${names.filter(f => existsSync(f) && isExcluded(f)).length}.`);
console.log("This checker does not remove files; original-language AI records are explicitly retained.");
if (failures.length) { console.error(failures.join("\n")); process.exitCode = 1; }
else console.log("PASS: no Cyrillic outside declared historical AI records; local Markdown links resolve without cleanup candidates.");
