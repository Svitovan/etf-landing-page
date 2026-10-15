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
  window.dispatchEvent(new CustomEvent("etf_consent_changed", { detail: { status } }));
}

export function revokeConsent(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONSENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("etf_consent_changed", { detail: { status: "denied" } }));
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

let initSessionPromise: Promise<boolean> | null = null;
let sessionGeneration = 0;

// Let consent initialization/recovery set its cookie before the lead POST.
// A slow or unavailable analytics service must not prevent contact delivery.
export async function trackLeadSubmissionAttempt(requestId: string, timeoutMs = 2000): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      trackEvent("form_submit_attempted", { requestId }),
      new Promise<void>(resolve => { timer = setTimeout(resolve, timeoutMs); }),
    ]);
  } catch {
    // Even unexpected browser storage/analytics errors must not cancel the lead.
  } finally {
    clearTimeout(timer);
  }
}

export async function initAnalyticsSession(): Promise<boolean> {
  if (getConsentStatus() !== "granted") return false;

  // B02: Deduplicate concurrent in-flight session initialization
  if (initSessionPromise) {
    return initSessionPromise;
  }

  initSessionPromise = (async () => {
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
      if (res.ok) sessionGeneration += 1;
      return res.ok;
    } catch {
      return false;
    } finally {
      initSessionPromise = null;
    }
  })();

  return initSessionPromise;
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

  // B02: Wait for any pending session initialization so cookies are present
  if (initSessionPromise) {
    await initSessionPromise;
  }

  const sendEvent = async (): Promise<Response> => {
    const eventId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `ev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    return fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        eventName,
        properties: properties || {},
      }),
    });
  };

  try {
    const sentGeneration = sessionGeneration;
    const res = await sendEvent();

    // A05 / B02: If session expired (403), re-initialize session atomically and retry once
    if (res.status === 403) {
      // A late 403 may belong to a request sent before another call set the
      // cookie. Reuse that completed initialization instead of replacing it.
      const reinitialized = initSessionPromise
        ? await initSessionPromise
        : sessionGeneration !== sentGeneration || await initAnalyticsSession();
      if (reinitialized) {
        await sendEvent();
      }
    }
  } catch {
    // Analytics error must never block user flow
  }
}

