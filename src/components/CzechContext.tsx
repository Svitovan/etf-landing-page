import React from "react";
import type { InvestorContext } from "../types/etf";
import { SourceLinks } from "./SourceLinks";

export const CzechContext: React.FC<{ context: InvestorContext }> = ({ context }) => {
  return (
    <section
      style={{
        paddingTop: "2.5rem",
        paddingBottom: "2.5rem",
        backgroundColor: "var(--bg-surface)",
        borderTop: "1px solid var(--border-light)",
        borderBottom: "1px solid var(--border-light)",
      }}
    >
      <div className="container">
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <span className="badge">3. Krok: Kontext pro českého investora</span>
            <h2
              style={{
                fontSize: "clamp(1.4rem, 3.5vw, 1.95rem)",
                fontWeight: 500,
                fontFamily: "var(--font-serif)",
                color: "var(--text-main)",
                letterSpacing: "-0.015em",
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              Co si ověřit před nákupem u českého brokera?
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Před nákupem si ověřte dostupnost produktu, měnové náklady a daňové podmínky:
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--border-light)",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                1. Nařízení PRIIPs a dokument KID
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.55 }}>
                {context.priips.value}
                <SourceLinks evidence={context.priips.evidence} />
              </p>
            </div>

            <div
              style={{
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--border-light)",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                2. Měnové poplatky (CZK &rarr; USD)
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.55 }}>
                Všechny tři fondy jsou kótovány v USD. Případný poplatek či kurzové rozpětí brokera za konverzi z CZK do USD může představovat nezanedbatelný vstupní náklad převyšující i roční nákladovost fondu. Před nákupem si ověřte přesné podmínky směny u své platformy.
              </p>
            </div>

            <div
              style={{
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--border-light)",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                3. Daně a dividendy (Formulář W-8BEN)
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.55 }}>
                {context.dividendTreaty.value}
              </p>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.55, marginTop: "0.5rem" }}>
                {context.w8ben.value}
              </p>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.55, marginTop: "0.5rem" }}>
                {context.withholding.value}
                <SourceLinks evidence={[...context.dividendTreaty.evidence, ...context.w8ben.evidence, ...context.withholding.evidence]} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
