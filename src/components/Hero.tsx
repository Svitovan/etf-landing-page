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
              fontSize: "clamp(1.85rem, 5vw, 2.5rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "var(--text-main)",
              letterSpacing: "-0.03em",
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
              marginBottom: "1.75rem",
            }}
          >
            {campaign.subheadline}
          </p>

          {/* Quick value upfront cards preview */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.5rem",
              marginBottom: "1.75rem",
              padding: "0.85rem",
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-light)", fontWeight: 600 }}>
                VOO
              </div>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--accent)" }}>
                0,03 %
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Vanguard</div>
            </div>

            <div
              style={{
                textAlign: "center",
                borderLeft: "1px solid var(--border-light)",
                borderRight: "1px solid var(--border-light)",
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "var(--text-light)", fontWeight: 600 }}>
                IVV
              </div>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--accent)" }}>
                0,03 %
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>iShares</div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-light)", fontWeight: 600 }}>
                SPY
              </div>
              <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--color-warning)" }}>
                0,0945 %
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>State Street</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <a
              href="#srovnani"
              className="btn-primary"
              id="hero-cta-compare"
            >
              {campaign.heroCta}
            </a>

            <a
              href="#kalkulacka"
              className="btn-secondary"
              id="hero-cta-calculator"
            >
              Kalkulačka nákladů v Kč
            </a>
          </div>

          <p
            style={{
              marginTop: "0.9rem",
              fontSize: "0.8rem",
              color: "var(--text-light)",
            }}
          >
            ✓ Ověřená data z NYSE Arca &bull; Bez registrace k okamžitému zobrazení &bull; Vzdělávací přehled
          </p>
        </div>
      </div>
    </section>
  );
};
