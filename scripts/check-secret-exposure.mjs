import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parseEnv } from "node:util";

// Values stay in memory. Output contains only variable names and file/object IDs.
const git = args => execFileSync("git", args, { encoding: "utf8", maxBuffer: 200 * 1024 * 1024 });
const configured = existsSync(".env") ? parseEnv(readFileSync(".env", "utf8")) : {};
const secrets = Object.entries(configured).filter(([name, value]) =>
  /SECRET|TOKEN|PASSWORD|PRIVATE_KEY|SERVICE_ROLE|API_KEY/.test(name) && value.length >= 24
  && !/^(?:local-dev-|sb_secret_your_|sb_publishable_your_)/.test(value)
);
const hits = [];
let objects = 0;
let files = 0;
const check = (buffer, location) => {
  for (const [name, value] of secrets) {
    if ([Buffer.from(value), Buffer.from(Buffer.from(value).toString("base64"))].some(needle => buffer.includes(needle))) {
      hits.push({ variable: name, location });
    }
  }
};

const names = git(["rev-list", "--objects", "--all"]).trim().split("\n").filter(Boolean).map(line => line.split(" ")[0]);
if (names.length) {
  const batch = execFileSync("git", ["cat-file", "--batch"], {
    input: names.join("\n") + "\n", maxBuffer: 200 * 1024 * 1024,
  });
  let offset = 0;
  while (offset < batch.length) {
    const newline = batch.indexOf(10, offset);
    const [hash, type, size] = batch.subarray(offset, newline).toString().split(" ");
    const length = Number(size);
    if (newline < 0 || !Number.isSafeInteger(length)) throw new Error("Invalid git batch response");
    offset = newline + 1;
    if (type === "blob") { objects += 1; check(batch.subarray(offset, offset + length), `git-blob:${hash}`); }
    offset += length + 1;
  }
}

for (const file of git(["ls-files", "-z", "--cached", "--others", "--exclude-standard"]).split("\0").filter(Boolean)) {
  if (existsSync(file) && statSync(file).isFile()) { files += 1; check(readFileSync(file), file); }
}
let clientFiles = 0;
function visit(directory) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) visit(path);
    else if (entry.isFile()) { clientFiles += 1; check(readFileSync(path), relative(process.cwd(), path)); }
  }
}
visit(".next/static");
console.log(JSON.stringify({ configuredSecretCount: secrets.length, gitBlobs: objects, trackedAndNewFiles: files, clientFiles, findings: hits }, null, 2));
if (!secrets.length) console.log("No non-example local secrets configured: exact-value check is unavailable; run Gitleaks separately.");
if (!clientFiles) console.log("No client build present: bundle check unavailable; build and rerun.");
if (hits.length) process.exitCode = 1;
