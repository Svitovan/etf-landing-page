"use client";

import React, { useState, useId, useRef } from "react";
import { trackEvent } from "../lib/analytics-client";

interface LeadFormProps {
  selectedEtfs: string[];
  positionValueCzk: number;
}

export const LeadForm: React.FC<LeadFormProps> = ({
  selectedEtfs,
  positionValueCzk,
}) => {
  const [email, setEmail] = useState<string>("");
  const [honeypot, setHoneypot] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // A03: Persist attempt requestId across retries so network timeouts/retries do not generate duplicates
  const attemptRequestIdRef = useRef<string | null>(null);

  const emailInputId = useId();

  const handleEmailFocus = () => {
    if (!hasStarted) {
      setHasStarted(true);
      trackEvent("form_started", { formVersion: "v1_single_email" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setErrorMessage("Zadejte prosím platnou e-mailovou adresu (např. jmeno@domena.cz).");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    if (!attemptRequestIdRef.current) {
      attemptRequestIdRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    const requestId = attemptRequestIdRef.current;

    trackEvent("form_submit_attempted", { requestId });

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          email: trimmed,
          selectedEtfs,
          positionValueCzk,
          privacyVersion: "2026-10-11",
          website: honeypot, // Honeypot must be empty
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setReportUrl(data.reportUrl || `/report?amount=${positionValueCzk}`);
      } else {
        setStatus("error");
        const msg = data.error || "Omlouváme se, uložení kontaktu se nezdařilo. Zkuste to prosím znovu.";
        setErrorMessage(msg);
        trackEvent("form_submit_failed", { errorCode: data.errorCode || "server_error" });
      }
    } catch {
      setStatus("error");
      setErrorMessage("Došlo k chybě sítě. Zkontrolujte připojení k internetu a zkuste to znovu.");
      trackEvent("form_submit_failed", { errorCode: "network_error" });
    }
  };

  if (status === "success" && reportUrl) {
    return (
      <div
        style={{
          padding: "1.75rem",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--color-success-bg)",
          border: "2px solid var(--color-success)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
        <h3
          style={{
            fontSize: "1.35rem",
            fontWeight: 800,
            color: "var(--text-main)",
            marginBottom: "0.5rem",
          }}
        >
          Přehled je připravený!
        </h3>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--text-muted)",
            lineHeight: 1.5,
            marginBottom: "1.25rem",
          }}
        >
          Váš kontakt byl úspěšně zaznamenán. Nyní si můžete kompletní srovnání a kontrolní seznam ihned otevřít a uložit do PDF.
        </p>

        <a
          href={reportUrl}
          className="btn-primary"
          style={{ width: "100%", maxWidth: "340px", fontSize: "1.05rem" }}
          id="open-report-button"
        >
          Otevřít přehled a kontrolní seznam
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-light)",
        padding: "1.75rem",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <div style={{ marginBottom: "1.25rem" }}>
        <label
          htmlFor={emailInputId}
          style={{
            display: "block",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "var(--text-main)",
            marginBottom: "0.4rem",
          }}
        >
          Váš e-mail pro zobrazení a uložení materiálu:
        </label>

        <input
          id={emailInputId}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          onFocus={handleEmailFocus}
          placeholder="např. jan.novak@seznam.cz"
          required
          autoComplete="email"
          aria-invalid={errorMessage ? "true" : "false"}
          aria-describedby={errorMessage ? `${emailInputId}-error` : undefined}
          style={{
            width: "100%",
            minHeight: "48px",
            padding: "0.75rem 1rem",
            fontSize: "1rem",
            borderRadius: "var(--radius-md)",
            border: `2px solid ${errorMessage ? "var(--color-error)" : "var(--border-light)"}`,
            backgroundColor: "var(--bg-page)",
            color: "var(--text-main)",
          }}
        />

        {/* Honeypot field (strictly hidden from screen readers and humans) */}
        <div aria-hidden="true" style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0, overflow: "hidden" }}>
          <label htmlFor="website-field">Nevyplňujte toto pole:</label>
          <input
            id="website-field"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {errorMessage && (
          <div
            id={`${emailInputId}-error`}
            role="alert"
            style={{
              color: "var(--color-error)",
              fontSize: "0.85rem",
              marginTop: "0.4rem",
              fontWeight: 500,
            }}
          >
            {errorMessage}
          </div>
        )}
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-primary"
          style={{
            width: "100%",
            opacity: status === "submitting" ? 0.75 : 1,
            cursor: status === "submitting" ? "not-allowed" : "pointer",
          }}
          id="submit-lead-button"
        >
          {status === "submitting" ? "Připravuji přehled..." : "Získat srovnání a kontrolní seznam"}
        </button>
      </div>

      <p
        style={{
          fontSize: "0.78rem",
          color: "var(--text-light)",
          lineHeight: 1.45,
          textAlign: "center",
        }}
      >
        Po odeslání se vám přehled ihned otevře a můžete si jej vytisknout nebo uložit do PDF. Žádný spam, vaše data jsou v bezpečí (
        <a href="/privacy" target="_blank" rel="noopener noreferrer">
          zásady ochrany soukromí
        </a>
        ).
      </p>
    </form>
  );
};
