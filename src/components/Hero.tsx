import React from "react";
import { CampaignHeadline } from "../data/campaign-copy";

interface HeroProps {
  campaign: CampaignHeadline;
}

export const Hero: React.FC<HeroProps> = ({ campaign }) => {
  return (
    <section
      style={{
        paddingTop: "2.5rem",
        paddingBottom: "2.5rem",
        backgroundColor: "var(--bg-page)",
      }}
    >
      <div className="container">
        <div style={{ maxWidth: "680px" }}>
          <div style={{ marginBottom: "1rem" }}>
            <span className="badge">{campaign.badge}</span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
              fontWeight: 500,
              lineHeight: 1.2,
              color: "var(--text-main)",
              letterSpacing: "-0.02em",
              marginBottom: "1rem",
            }}
          >
            {campaign.headline}
          </h1>

          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.6,
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
            }}
          >
            {campaign.subheadline}
          </p>

          {/* Quick value upfront cards preview */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.35rem",
              marginBottom: "1.5rem",
              padding: "0.75rem 0.5rem",
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ textAlign: "center", minWidth: 0 }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-light)", fontWeight: 600 }}>
                VOO
              </div>
              <div className="tabular-nums" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>
                0,03 %
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Vanguard
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                minWidth: 0,
                borderLeft: "1px solid var(--border-light)",
                borderRight: "1px solid var(--border-light)",
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "var(--text-light)", fontWeight: 600 }}>
                IVV
              </div>
              <div className="tabular-nums" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>
                0,03 %
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                iShares
              </div>
            </div>

            <div style={{ textAlign: "center", minWidth: 0 }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-light)", fontWeight: 600 }}>
                SPY
              </div>
              <div className="tabular-nums" style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-warning)" }}>
                0,0945 %
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                State Street
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              width: "100%",
              maxWidth: "420px",
            }}
          >
            <a
              href="#srovnani"
              className="btn-primary"
              id="hero-cta-compare"
              style={{ width: "100%", justifyContent: "center", textAlign: "center" }}
            >
              {campaign.heroCta}
            </a>

            <a
              href="#ziskat-prehled"
              className="btn-secondary"
              id="hero-cta-checklist"
              style={{ width: "100%", justifyContent: "center", textAlign: "center" }}
            >
              Získat srovnání a kontrolní seznam
            </a>
          </div>

          <p
            style={{
              marginTop: "0.85rem",
              fontSize: "0.78rem",
              color: "var(--text-light)",
              lineHeight: 1.4,
            }}
          >
            ✓ Ověřená data z NYSE Arca &bull; Bez registrace k okamžitému zobrazení &bull; Vzdělávací přehled
          </p>
        </div>
      </div>
    </section>
  );
};
