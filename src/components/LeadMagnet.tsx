import React from "react";
import { LeadForm } from "./LeadForm";

interface LeadMagnetProps {
  selectedEtfs: string[];
  positionValueCzk: number;
}

export const LeadMagnet: React.FC<LeadMagnetProps> = ({
  selectedEtfs,
  positionValueCzk,
}) => {
  return (
    <section
      id="ziskat-prehled"
      style={{
        paddingTop: "3rem",
        paddingBottom: "3rem",
        backgroundColor: "var(--bg-page)",
      }}
    >
      <div className="container">
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <span className="badge">4. Krok: Uložení materiálu</span>
            <h2
              style={{
                fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                fontWeight: 800,
                color: "var(--text-main)",
                letterSpacing: "-0.03em",
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              Získejte kompletní srovnání a kontrolní seznam v PDF
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.98rem" }}>
              Vše, co potřebujete mít při ruce, než otevřete účet u brokera nebo provedete první nákup.
            </p>
          </div>

          {/* Lead Magnet Preview Card */}
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-light)",
              padding: "1.5rem",
              marginBottom: "1.5rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "var(--accent)",
                marginBottom: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              📄 Co přesně v materiálu najdete:
            </h3>

            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                fontSize: "0.9rem",
                color: "var(--text-main)",
              }}
            >
              <li style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>✓</span>
                <div>
                  <strong>Kompletní srovnávací přehled VOO vs. IVV vs. SPY</strong> – detailní parametry, správci, právní forma UIT a dividendy.
                </div>
              </li>
              <li style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>✓</span>
                <div>
                  <strong>Ilustrativní výpočet nákladů pro vaši částku</strong> – roční rozdíly a 10letý horizont v českých korunách.
                </div>
              </li>
              <li style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>✓</span>
                <div>
                  <strong>5bodový kontrolní checklist pro českého investora</strong> – ověření KID, měnové poplatky, W-8BEN a evropské UCITS alternativy.
                </div>
              </li>
              <li style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>✓</span>
                <div>
                  <strong>Slovníček základních pojmů</strong> – Expense Ratio, NAV, Bid-Ask spread, reinvestice dividend.
                </div>
              </li>
            </ul>
          </div>

          {/* The Actual Form */}
          <LeadForm
            selectedEtfs={selectedEtfs}
            positionValueCzk={positionValueCzk}
          />
        </div>
      </div>
    </section>
  );
};
