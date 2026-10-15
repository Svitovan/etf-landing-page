import crypto from "node:crypto";
import {
  getSupabaseServerClient,
  memoryStore,
  AnalyticsSessionRow,
  AnalyticsEventRow,
} from "./db";
import { AnalyticsEventPayload } from "../validation";
import { markMemoryTestSessions } from "./test-traffic";

const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export async function createAnalyticsSession(
  consentVersion: string,
  utmContent: string | null
): Promise<{ sessionId: string; expiresAt: Date }> {
  const sessionId = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    await supabase.from("analytics_sessions").insert({
      id: sessionId,
      consent_version: consentVersion,
      utm_content: utmContent,
      is_active: true,
      expires_at: expiresAt.toISOString(),
    });
  } else {
    memoryStore.sessions.push({
      id: sessionId,
      consent_version: consentVersion,
      utm_content: utmContent,
      is_active: true,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    });
  }

  return { sessionId, expiresAt };
}

export async function deactivateAnalyticsSession(sessionId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    await supabase
      .from("analytics_sessions")
      .update({ is_active: false })
      .eq("id", sessionId);
  } else {
    const s = memoryStore.sessions.find((sess) => sess.id === sessionId);
    if (s) s.is_active = false;
  }
}

export async function isSessionValid(sessionId: string): Promise<boolean> {
  const now = new Date();
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data } = await supabase
      .from("analytics_sessions")
      .select("is_active, expires_at")
      .eq("id", sessionId)
      .single();

    if (!data || !data.is_active) return false;
    return new Date(data.expires_at) > now;
  }

  const s = memoryStore.sessions.find((sess) => sess.id === sessionId);
  if (!s || !s.is_active) return false;
  return new Date(s.expires_at) > now;
}

export async function recordAnalyticsEvent(
  sessionId: string,
  payload: AnalyticsEventPayload
): Promise<boolean> {
  const valid = await isSessionValid(sessionId);
  if (!valid) {
    return false;
  }

  const supabase = getSupabaseServerClient();
  if (supabase) {
    // Deduplicate eventId
    const { error } = await supabase.from("analytics_events").insert({
      event_id: payload.eventId,
      session_id: sessionId,
      event_name: payload.eventName,
      properties: payload.properties || {},
    });
    return !error;
  }

  // Fallback memory
  const exists = memoryStore.events.some((e) => e.event_id === payload.eventId);
  if (exists) return true; // idempotent

  const eventRow: AnalyticsEventRow = {
    id: crypto.randomUUID(),
    event_id: payload.eventId,
    session_id: sessionId,
    event_name: payload.eventName,
    properties: payload.properties || {},
    server_timestamp: new Date().toISOString(),
  };
  memoryStore.events.push(eventRow);
  if (payload.eventName === "form_submit_attempted" && memoryStore.submissions.some(s =>
    s.is_test && s.request_id === payload.properties?.requestId
  )) markMemoryTestSessions(String(payload.properties?.requestId), sessionId);
  return true;
}
