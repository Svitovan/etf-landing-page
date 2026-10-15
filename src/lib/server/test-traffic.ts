import { memoryStore } from "./db";

export function isDemoEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  return ["example.com", "example.net", "example.org", "test", "invalid"].includes(domain)
    || !!domain && (domain.endsWith(".test") || domain.endsWith(".invalid"));
}

export function markMemoryTestSessions(requestId: string, sessionId: string | null): void {
  const ids = new Set([sessionId, ...memoryStore.events.filter(e =>
    e.event_name === "form_submit_attempted" && e.properties.requestId === requestId
  ).map(e => e.session_id)]);
  memoryStore.sessions.filter(s => ids.has(s.id)).forEach(s => { s.is_test = true; });
}
