"use client";

const CONSENT_STORAGE_KEY = "etf_analytics_consent";
const ALLOWED_UTM_CONTENTS = ["ad_a", "ad_b"] as const;

export type ConsentStatus = "granted" | "denied" | "undecided";

export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") return "undecided";
  const val = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (val === "granted") return "granted";
  if (val === "denied") return "denied";
  return "undecided";
}

export function setConsentStatus(status: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_STORAGE_KEY, status);
}

export function revokeConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONSENT_STORAGE_KEY);
  // Also call backend to deactivate session cookie if present
  fetch("/api/analytics-session", { method: "DELETE" }).catch(() => {});
}

export function getSanitizedUtm(): { utmContent: string | null } {
  if (typeof window === "undefined") return { utmContent: null };
  const params = new URLSearchParams(window.location.search);
  const rawContent = params.get("utm_content");
  if (rawContent && (ALLOWED_UTM_CONTENTS as readonly string[]).includes(rawContent)) {
    return { utmContent: rawContent };
  }
  return { utmContent: null };
}

export async function initAnalyticsSession(): Promise<boolean> {
  if (getConsentStatus() !== "granted") return false;

  const { utmContent } = getSanitizedUtm();
  try {
    const res = await fetch("/api/analytics-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consentVersion: "2026-10-11",
        utmContent,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function trackEvent(
  eventName:
    | "landing_observed"
    | "comparison_viewed"
    | "calculator_used"
    | "lead_cta_clicked"
    | "form_started"
    | "form_submit_attempted"
    | "form_submit_failed"
    | "report_opened",
  properties?: Record<string, string | number | boolean | null>
): Promise<void> {
  // STRICT RULE: No behavioral analytics without explicit consent
  if (getConsentStatus() !== "granted") {
    return;
  }

  const eventId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `ev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        eventName,
        properties: properties || {},
      }),
    });
  } catch {
    // Analytics error must never block user flow
  }
}
