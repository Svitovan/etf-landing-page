// Export visible messages from Antigravity IDE transcripts for this project.
// Redacts secrets, credentials, emails, IPs, local paths and database endpoints.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const brainDir = process.argv[2] || path.join(os.homedir(), ".gemini", "antigravity-ide", "brain");
const targetDir = fileURLToPath(new URL("../ai-log/exports/antigravity/", import.meta.url));

const SESSIONS = [
  {
    id: "e74b3c28-774f-4235-8b5e-2a7014ea3fcc",
    filename: "01-session-2026-10-11-initial-implementation-e74b3c28.md",
    title: "\u0421\u0435\u0441\u0441\u0438\u044f 1: \u0418\u043d\u0438\u0446\u0438\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f \u043f\u0440\u043e\u0435\u043a\u0442\u0430 \u0438 \u0440\u0435\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f \u044d\u0442\u0430\u043f\u043e\u0432 E0\u2013E8",
    topic: "\u041f\u0435\u0440\u0432\u043e\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u044b\u0439 \u0437\u0430\u043f\u0443\u0441\u043a \u043f\u0440\u043e\u0435\u043a\u0442\u0430, \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u0435 \u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u044b Next.js, \u0434\u0430\u0442\u0430\u0441\u0435\u0442\u0430 ETF (VOO, IVV, SPY), UI \u043b\u0435\u043d\u0434\u0438\u043d\u0433\u0430, \u043a\u0430\u043b\u044c\u043a\u0443\u043b\u044f\u0442\u043e\u0440\u0430, \u0444\u043e\u0440\u043c\u044b \u0438 PDF-\u043e\u0442\u0447\u0451\u0442\u0430.",
    date: "2026-10-11"
  },
  {
    id: "e1798fde-466d-46a8-aeba-2b8dd80ee772",
    filename: "02-session-2026-10-11-readiness-audit-setup-e1798fde.md",
    title: "\u0421\u0435\u0441\u0441\u0438\u044f 2: \u0410\u0443\u0434\u0438\u0442 \u0441\u043e\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u044f \u043f\u043b\u0430\u043d\u0443 \u0440\u0435\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u0438 \u0438 \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430 \u0440\u0435\u043f\u043e\u0437\u0438\u0442\u043e\u0440\u0438\u044f",
    topic: "\u0421\u0432\u0435\u0440\u043a\u0430 \u0441 \u043f\u043b\u0430\u043d\u043e\u043c implementation-plan, \u0437\u0430\u043f\u0443\u0441\u043a \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u043e\u0433\u043e \u043e\u043a\u0440\u0443\u0436\u0435\u043d\u0438\u044f, \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430 \u0440\u0435\u043f\u043e\u0437\u0438\u0442\u043e\u0440\u0438\u044f GitHub.",
    date: "2026-10-11"
  },
  {
    id: "80ff471b-bd0e-4573-ab26-6285c66f8ae4",
    filename: "03-session-2026-10-15-stitch-mcp-design-80ff471b.md",
    title: "\u0421\u0435\u0441\u0441\u0438\u044f 3: \u0421\u0438\u043d\u0445\u0440\u043e\u043d\u0438\u0437\u0430\u0446\u0438\u044f \u0441 \u0434\u0438\u0437\u0430\u0439\u043d\u043e\u043c Google Stitch MCP",
    topic: "\u0410\u043d\u0430\u043b\u0438\u0437 \u043c\u0430\u043a\u0435\u0442\u043e\u0432 Stitch MCP ('ETF P\u0159ehled Landing Design'), \u0432\u044b\u0440\u0430\u0432\u043d\u0438\u0432\u0430\u043d\u0438\u0435 \u0442\u0438\u043f\u043e\u0433\u0440\u0430\u0444\u0438\u043a\u0438, \u043e\u0442\u0441\u0442\u0443\u043f\u043e\u0432 \u0438 \u0443\u0441\u0442\u0440\u0430\u043d\u0435\u043d\u0438\u0435 \u043c\u043e\u0431\u0438\u043b\u044c\u043d\u043e\u0433\u043e \u043f\u0435\u0440\u0435\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f \u0432\u0435\u0440\u0441\u0442\u043a\u0438.",
    date: "2026-10-15"
  },
  {
    id: "b27df57e-029d-4fe4-966d-02f347aecd57",
    filename: "04-session-2026-10-15-supabase-vercel-integration-b27df57e.md",
    title: "\u0421\u0435\u0441\u0441\u0438\u044f 4: \u0418\u043d\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u044f \u0441 Supabase \u0438 Vercel, \u0438\u0441\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u0434\u0435\u0444\u0435\u043a\u0442\u043e\u0432 \u0430\u0443\u0434\u0438\u0442\u0430",
    topic: "\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u0436\u0438\u0432\u043e\u0439 \u0411\u0414 Supabase, RLS, Vercel deployment, \u0438\u0441\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u0430\u0442\u043e\u043c\u0430\u0440\u043d\u043e\u0441\u0442\u0438 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f \u043b\u0438\u0434\u043e\u0432 \u0438 \u0432\u0430\u043b\u0438\u0434\u0430\u0446\u0438\u044f \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0438.",
    date: "2026-10-15"
  },
  {
    id: "50d92dc2-3ac1-481c-a913-3a2bacf445b5",
    filename: "05-session-2026-10-15-priority-fixes-hardening-50d92dc2.md",
    title: "\u0421\u0435\u0441\u0441\u0438\u044f 5: \u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u043d\u044b\u0435 \u0438\u0441\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f: submit_lead RPC, \u043c\u0438\u0433\u0440\u0430\u0446\u0438\u0438 \u0438 \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c",
    topic: "\u0420\u0435\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f \u0438 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0430 \u0444\u0443\u043d\u043a\u0446\u0438\u0438 submit_lead, \u0432\u0430\u043b\u0438\u0434\u0430\u0446\u0438\u044f \u043f\u043e\u043b\u0435\u0439, idempotency, \u0437\u0430\u0449\u0438\u0442\u0430 \u043e\u0442 race conditions, \u0441\u0438\u043d\u0445\u0440\u043e\u043d\u0438\u0437\u0430\u0446\u0438\u044f \u0441 \u0443\u0434\u0430\u043b\u0435\u043d\u043d\u044b\u043c \u0440\u0435\u043f\u043e\u0437\u0438\u0442\u043e\u0440\u0438\u0435\u043c.",
    date: "2026-10-15"
  },
  {
    id: "e8fe8e10-46ce-4056-af6f-036bd4627118",
    filename: "06-session-2026-10-15-git-sync-docs-e8fe8e10.md",
    title: "\u0421\u0435\u0441\u0441\u0438\u044f 6: \u0421\u0438\u043d\u0445\u0440\u043e\u043d\u0438\u0437\u0430\u0446\u0438\u044f Git \u0438 \u0444\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\u0446\u0438\u0438",
    topic: "\u0424\u0438\u043a\u0441\u0430\u0446\u0438\u044f \u043a\u043e\u043c\u043c\u0438\u0442\u043e\u0432 aceae4b \u0438 97596ce, \u044d\u043a\u0441\u043f\u043e\u0440\u0442 \u0436\u0443\u0440\u043d\u0430\u043b\u043e\u0432 Codex \u0438 \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\u0446\u0438\u0438 \u0434\u043b\u044f \u0441\u0434\u0430\u0447\u0438.",
    date: "2026-10-15"
  },
  {
    id: "f8e91b8f-c55c-47a2-aebf-daf910149e3d",
    filename: "07-session-2026-10-15-desktop-centering-f8e91b8f.md",
    title: "\u0421\u0435\u0441\u0441\u0438\u044f 7: \u0412\u0435\u0440\u0441\u0442\u043a\u0430: \u0446\u0435\u043d\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u043a\u043e\u043d\u0442\u0435\u043d\u0442\u0430 Hero-\u0441\u0435\u043a\u0446\u0438\u0438 \u043d\u0430 \u0434\u0435\u0441\u043a\u0442\u043e\u043f\u0435",
    topic: "\u0414\u043e\u0440\u0430\u0431\u043e\u0442\u043a\u0430 \u0441\u0442\u0438\u043b\u0435\u0439 \u0432 globals.css \u0434\u043b\u044f \u0430\u043a\u043a\u0443\u0440\u0430\u0442\u043d\u043e\u0433\u043e \u0446\u0435\u043d\u0442\u0440\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0430 \u0438 \u043f\u043e\u0434\u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0430 \u043f\u0435\u0440\u0432\u043e\u0439 \u0441\u0435\u043a\u0446\u0438\u0438 \u043f\u0440\u0438 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0438 \u043c\u043e\u0431\u0438\u043b\u044c\u043d\u043e\u0433\u043e UX.",
    date: "2026-10-15"
  },
  {
    id: "12c86b56-3caf-4ca3-bd81-f956d7713a40",
    filename: "08-session-2026-10-15-chat-export-12c86b56.md",
    title: "\u0421\u0435\u0441\u0441\u0438\u044f 8: \u042d\u043a\u0441\u043f\u043e\u0440\u0442 AI-\u0434\u0438\u0430\u043b\u043e\u0433\u043e\u0432 Antigravity \u0432 \u0440\u0435\u043f\u043e\u0437\u0438\u0442\u043e\u0440\u0438\u0439",
    topic: "\u041e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430 \u0437\u0430\u043f\u0440\u043e\u0441\u0430 \u043d\u0430 \u044d\u043a\u0441\u043f\u043e\u0440\u0442 \u0432\u0441\u0435\u0445 \u0441\u0435\u0441\u0441\u0438\u0439 Antigravity \u0432 Markdown-\u0444\u0430\u0439\u043b\u044b \u0441 \u0430\u043d\u043e\u043d\u0438\u043c\u0438\u0437\u0430\u0446\u0438\u0435\u0439 \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0445 \u0434\u0430\u043d\u043d\u044b\u0445.",
    date: "2026-10-15"
  }
];

const redactions = {};
function redact(text) {
  if (!text) return "";

  // Convert local file links like [file](file:///c:/...) into code backticks `file`
  text = text.replace(/\[([^\]\r\n]+)\]\((?:file:\/\/\/)?[A-Za-z]:[\\/][^\)\r\n]*\)/g, "`$1`");

  const rules = [
    ["secret", /\b(?:sb_secret_|sb_publishable_|sk-(?:proj-)?|gh[pousr]_|github_pat_|vercel_)[A-Za-z0-9_-]{12,}\b/g],
    ["jwt", /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g],
    ["email", /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi],
    ["ipv4", /\b(?:\d{1,3}\.){3}\d{1,3}\b/g],
    ["local-path", /(?<![A-Za-z])(?:file:\/\/\/)?[A-Za-z]:[\\/][^\n<>"`]*/g],
    ["supabase-project", /https:\/\/[a-z0-9]+\.supabase\.co\b/gi],
    ["credential-assignment", /((?:SUPABASE_(?:SECRET_KEY|SERVICE_ROLE_KEY|ACCESS_TOKEN)|VERCEL_TOKEN|RATE_LIMIT_SALT)\s*[=:]\s*)[^\s|`]+/g],
  ];
  for (const [kind, pattern] of rules) {
    text = text.replace(pattern, () => {
      redactions[kind] = (redactions[kind] || 0) + 1;
      return `[REDACTED:${kind}]`;
    });
  }
  return text;
}

function cleanUserContent(raw) {
  if (!raw) return "";
  const match = raw.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
  if (match) {
    return match[1].trim();
  }
  let text = raw.replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, "");
  text = text.replace(/<USER_SETTINGS_CHANGE>[\s\S]*?<\/USER_SETTINGS_CHANGE>/g, "");
  return text.trim();
}

// Read every selected source before writing anything. Missing or malformed input fails.
const manifest = {
  format: "Redacted visible messages from selected Antigravity transcript.jsonl files; not a native or complete raw export",
  generatedAt: new Date().toISOString(),
  targetDirectory: "ai-log/exports/antigravity",
  totalSessions: SESSIONS.length,
  sessions: [],
  redactionsSummary: redactions,
  limitations: [
    "Eight explicitly selected project sessions; no claim that all IDE sessions are included",
    "Only USER_INPUT and nonempty PLANNER_RESPONSE.content; no thinking, tools, system content or images",
    "Source content can already be truncated; per-session counts record source truncation without reconstructing missing text",
    "Message bodies remain in their original language except labeled privacy redactions",
    "Session titles and descriptions are editorial metadata, not original messages",
    "No synthetic assistant responses are inserted; historical statements are not current QA evidence"
  ]
};
const outputs = [];
for (const meta of SESSIONS) {
  const transcriptPath = path.join(brainDir, meta.id, ".system_generated", "logs", "transcript.jsonl");
  const raw = fs.readFileSync(transcriptPath, "utf8");
  const rows = raw.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  const messages = [];
  for (const row of rows) {
    if (!["USER_INPUT", "PLANNER_RESPONSE"].includes(row.type)) continue;
    if (typeof row.content !== "string") continue;
    const content = row.type === "USER_INPUT" ? cleanUserContent(row.content) : row.content.trim();
    if (!content) continue;
    messages.push({
      role: row.type === "USER_INPUT" ? "user" : "assistant",
      timestamp: row.created_at || null,
      sourceStep: row.step_index ?? null,
      sourceContentTruncated: Array.isArray(row.truncated_fields) && row.truncated_fields.includes("content"),
      text: redact(content)
    });
  }
  const userMessages = messages.filter(m => m.role === "user").length;
  const sourceContentTruncatedMessages = messages.filter(m => m.sourceContentTruncated).length;
  const item = {
    sessionId: meta.id, filename: meta.filename, title: meta.title, topic: meta.topic, date: meta.date,
    sourceFile: meta.id + "/.system_generated/logs/transcript.jsonl",
    sha256: crypto.createHash("sha256").update(raw).digest("hex"),
    totalMessages: messages.length, userMessages, assistantMessages: messages.length - userMessages,
    sourceContentTruncatedMessages,
    firstTimestamp: messages[0]?.timestamp || null, lastTimestamp: messages.at(-1)?.timestamp || null
  };
  let text = "# " + meta.title + "\n\n";
  text += "> Session: " + meta.id + " | Date: " + meta.date + "\n";
  text += "> Exported messages: " + messages.length + "; source-truncated messages: " + sourceContentTruncatedMessages + ".\n";
  text += "> Editorial heading; original message bodies below. Missing source text is not reconstructed.\n\n---\n\n";
  for (const [index, message] of messages.entries()) {
    text += "### " + (index + 1) + ". " + (message.role === "user" ? "User" : "Assistant (Antigravity)") + " — *" + (message.timestamp || "timestamp unavailable") + "*\n\n";
    if (message.sourceContentTruncated) text += "> [EXPORT NOTE: The source marks this message content as truncated.]\n\n";
    text += message.text + "\n\n---\n\n";
  }
  item.exportSha256 = crypto.createHash("sha256").update(text).digest("hex");
  manifest.sessions.push(item);
  outputs.push({ filename: meta.filename, text });
}
manifest.totalMessages = manifest.sessions.reduce((n, s) => n + s.totalMessages, 0);
manifest.sourceContentTruncatedMessages = manifest.sessions.reduce((n, s) => n + s.sourceContentTruncatedMessages, 0);
let readme = "# Antigravity: export vybraných projektových relací\n\n";
readme += "Obsahuje " + manifest.totalSessions + " vybraných relací a " + manifest.totalMessages + " dostupných zpráv z 11.–15. 10. 2026. Jde o redigované zprávy, nikoli nový přepis nebo shrnutí. Úplnost všech relací IDE se netvrdí.\n\n";
readme += "**Omezení zdroje:** " + manifest.sourceContentTruncatedMessages + " zpráv má již v původním transcriptu příznak zkráceného obsahu. Chybějící text není domýšlen; dotčené zprávy jsou označeny.\n\n";
readme += "| Relace | Datum | Zprávy | Zkrácené ve zdroji |\n|---|---|---:|---:|\n";
for (const s of manifest.sessions) readme += "| [" + s.filename + "](" + s.filename + ") | " + s.date + " | " + s.totalMessages + " | " + s.sourceContentTruncatedMessages + " |\n";
readme += "\n[Společný soubor](all-antigravity-sessions-combined.md), [manifest a kontrolní součty](manifest.json), [aktuální QA](../../../docs/qa-report.md).\n\n";
readme += "Ponechány jsou USER_INPUT a neprázdné PLANNER_RESPONSE.content. Neexportují se thinking, system obsah, nástroje ani obrázky. Rozpoznaná tajemství, emaily, IP, lokální cesty a DB endpointy jsou redigovány. Hlavičky a témata relací jsou redakční metadata; těla zpráv zůstávají v původním jazyce. Žádná odpověď asistenta se nevytváří automaticky. Nejde o nativní Claude /export ani úplnou raw trajektorii.\n\n";
readme += "Manifest rozlišuje SHA-256 lokálního zdroje a výsledného Markdownu. Změna pokračující relace změní zdrojový hash při příštím exportu. Soukromé zdroje nejsou v repozitáři. Reprodukce: node scripts/export-antigravity-sessions.mjs [local-brain-directory]; před publikací vždy zkontrolovat citlivá data.\n";
const combined = "# Antigravity — selected project sessions\n\nSee README.md and manifest.json for scope, redactions and source truncation.\n\n" + outputs.map(o => o.text).join("\n\n");
fs.mkdirSync(targetDir, { recursive: true });
for (const output of outputs) fs.writeFileSync(path.join(targetDir, output.filename), output.text, "utf8");
fs.writeFileSync(path.join(targetDir, "all-antigravity-sessions-combined.md"), combined, "utf8");
fs.writeFileSync(path.join(targetDir, "README.md"), readme, "utf8");
fs.writeFileSync(path.join(targetDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ sessions: manifest.totalSessions, messages: manifest.totalMessages, sourceTruncated: manifest.sourceContentTruncatedMessages, redactions }, null, 2));
