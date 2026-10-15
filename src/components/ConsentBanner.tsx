"use client";

import React, { useState, useEffect } from "react";
import {
  getConsentStatus,
  setConsentStatus,
  initAnalyticsSession,
  trackEvent,
  ConsentStatus,
} from "../lib/analytics-client";

export const ConsentBanner: React.FC = () => {
  const [status, setStatus] = useState<ConsentStatus>("undecided");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setStatus(getConsentStatus());
  }, []);

  if (!mounted || status !== "undecided") {
    return null;
  }

  const handleAccept = async () => {
    setConsentStatus("granted");
    setStatus("granted");
    const ok = await initAnalyticsSession();
    if (ok) {
      trackEvent("landing_observed", { pageVersion: "v1" });
    }
  };

  const handleDecline = () => {
    setConsentStatus("denied");
    setStatus("denied");
  };

  return (
    <aside
      aria-label="Nastavení cookies a soukromí"
      className="consent-banner"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "var(--bg-surface)",
        borderTop: "1px solid var(--border-light)",
        padding: "0.75rem 0",
        boxShadow: "var(--shadow-lg)",
        zIndex: 100,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div style={{ flex: "1 1 200px", minWidth: 0, fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.45 }}>
          <strong>Respektujeme vaše soukromí: </strong>
          Tento web používá anonymní analytiku návštěvnosti pouze s vaším souhlasem. Srovnání i kalkulačka fungují plnohodnotně i bez povolení cookies (
          <a href="/privacy" style={{ color: "var(--accent)" }}>
            více informací
          </a>
          ).
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleDecline}
            className="btn-secondary"
            style={{ fontSize: "0.85rem", minHeight: "40px", padding: "0.4rem 0.9rem" }}
            id="cookie-consent-decline"
          >
            Pouze nezbytné
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="btn-primary"
            style={{ fontSize: "0.85rem", minHeight: "40px", padding: "0.4rem 0.9rem" }}
            id="cookie-consent-accept"
          >
            Povolit analytiku
          </button>
        </div>
      </div>
    </aside>
  );
};
