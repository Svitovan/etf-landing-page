// Export only human-visible messages from explicitly supplied Codex JSONL logs.
// Never export developer/system instructions, reasoning, tool calls or tool outputs.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const sources = process.argv.slice(2);
if (!sources.length) throw new Error("Supply the JSONL files belonging to this project conversation.");
const target = fileURLToPath(new URL("../ai-log/exports/", import.meta.url));
const redactions = {};
function redact(text) {
  const rules = [
    ["secret", /\b(?:sb_secret_|sb_publishable_|sk-(?:proj-)?|gh[pousr]_|github_pat_|vercel_)[A-Za-z0-9_-]{12,}\b/g],
    ["jwt", /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g],
    ["email", /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi],
    ["ipv4", /\b(?:\d{1,3}\.){3}\d{1,3}\b/g],
    ["local-path", /(?<![A-Za-z])(?:file:\/\/\/)?[A-Za-z]:[\\/][^\n<>"`]*/g],
    ["supabase-project", /https:\/\/[a-z0-9]+\.supabase\.co\b/gi],
    ["private-id", /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi],
    ["credential-assignment", /((?:SUPABASE_(?:SECRET_KEY|SERVICE_ROLE_KEY|ACCESS_TOKEN)|VERCEL_TOKEN|RATE_LIMIT_SALT)\s*[=:]\s*)[^\s|`]+/g],
  ];
  for (const [kind, pattern] of rules) text = text.replace(pattern, () => {
    redactions[kind] = (redactions[kind] || 0) + 1;
    return `[REDACTED:${kind}]`;
  });
  return text;
}

const messages = [];
const provenance = [];
const seen = new Set();
let omittedContextBlocks = 0;
let omittedAttachments = 0;
for (const source of sources) {
  const raw = fs.readFileSync(source, "utf8");
  provenance.push({ sourceFile: path.basename(source), sha256: crypto.createHash("sha256").update(raw).digest("hex") });
  for (const line of raw.split(/\r?\n/).filter(Boolean)) {
    const row = JSON.parse(line);
    const message = row.payload;
    if (row.type !== "response_item" || message?.type !== "message") continue;
    if (!["user", "assistant"].includes(message.role)) continue;
    if (message.role === "assistant" && !["commentary", "final", "final_answer"].includes(message.phase || message.channel)) continue;
    const chunks = [];
    for (const chunk of message.content || []) {
      if (!["input_text", "output_text"].includes(chunk.type)) { omittedAttachments++; continue; }
      // The desktop injects these blocks as user-role messages; they are not human prompts.
      if (/^\s*(?:# AGENTS\.md instructions|<environment_context>|<external_codex_apps_open_page>|<permissions instructions>)/.test(chunk.text)) {
        omittedContextBlocks++; continue;
      }
      chunks.push(chunk.text);
    }
    const original = chunks.join("\n");
    if (!original.trim()) continue;
    const key = `${row.timestamp}:${message.role}:${original}`;
    if (seen.has(key)) continue;
    seen.add(key);
    messages.push({ timestamp: row.timestamp, role: message.role, phase: message.phase || message.channel || null, text: redact(original) });
  }
}
if (!messages.length) throw new Error("No visible messages found; no export written.");
messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
fs.mkdirSync(target, { recursive: true });
const stem = "codex-project-conversation-2026-10-15";
const manifest = {
  format: "Redacted visible-message export from Codex JSONL; not a full raw trajectory or native /export",
  sources: provenance,
  firstMessage: messages[0].timestamp,
  lastMessage: messages.at(-1).timestamp,
  messages: messages.length,
  roles: Object.fromEntries(["user", "assistant"].map(role => [role, messages.filter(m => m.role === role).length])),
  omittedContextBlocks, omittedAttachments, redactions,
  limitations: ["Only supplied project logs, not all Antigravity or Codex sessions", "No system/developer content, reasoning or tools", "Images/binary attachments omitted; surrounding text retained", "Historical claims are not current QA evidence"],
};
fs.writeFileSync(path.join(target, `${stem}.jsonl`), messages.map(m => JSON.stringify(m)).join("\n") + "\n");
fs.writeFileSync(path.join(target, `${stem}.manifest.json`), JSON.stringify(manifest, null, 2) + "\n");
const preface = `# Visible project conversation export — Codex\n\nRedacted actual messages from JSONL, not a summary or full raw/native export. System instructions, internal reasoning, tools and images are excluded. Secrets, emails, IPs, local paths and identifiers are replaced by markers. Historical statements may have been superseded; current evidence is in docs/qa-report.md.\n\nPeriod: ${manifest.firstMessage} — ${manifest.lastMessage}. Messages: ${messages.length}. Sources, checksums and limitations: the adjacent manifest.json.\n\n`;
fs.writeFileSync(path.join(target, `${stem}.md`), preface + messages.map((m, i) => `## ${i + 1}. ${m.role === "user" ? "User" : "Assistant"} — ${m.timestamp}\n\n${m.text}\n\n`).join(""));
console.log(JSON.stringify({ exportedMessages: messages.length, redactions, omittedContextBlocks, omittedAttachments }));
