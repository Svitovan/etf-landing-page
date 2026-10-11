"use client";

import React from "react";
import { revokeConsent } from "../lib/analytics-client";

export const Footer: React.FC = () => {
  const handleResetConsent = () => {
    revokeConsent();
    window.location.reload();
  };

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-light)",
        backgroundColor: "var(--bg-surface)",
        paddingTop: "2.5rem",
        paddingBottom: "2.5rem",
        fontSize: "0.82rem",
        color: "var(--text-light)",
      }}
    >
      <div className="container">
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-page)",
              border: "1px solid var(--border-light)",
              marginBottom: "1.5rem",
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: "var(--text-main)" }}>Důležité právní upozornění: </strong>
            Tato stránka a poskytovaný přehled mají výhradně vzdělávací a informační charakter. Nepředstavují investiční poradenství, investiční doporučení ani nabídku k nákupu či prodeji cenných papírů ve smyslu zákona č. 256/2004 Sb., o podnikání na kapitálovém trhu. Minulá výkonnost nezaručuje budoucí výnosy.
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              borderTop: "1px solid var(--border-light)",
              paddingTop: "1.25rem",
            }}
          >
            <div>
              &copy; {new Date().getFullYear()} ETF Přehled &bull; Nezávislý studentský a vzdělávací projekt
            </div>

            <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
              <a href="/privacy" style={{ color: "var(--text-muted)" }}>
                Zásady ochrany soukromí
              </a>
              <button
                type="button"
                onClick={handleResetConsent}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  textDecoration: "underline",
                  fontSize: "inherit",
                  cursor: "pointer",
                  padding: 0,
                }}
                id="reset-consent-button"
              >
                Nastavení soukromí / cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
