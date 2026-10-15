import React from "react";
import { CampaignHeadline } from "../data/campaign-copy";
import { trackEvent } from "../lib/analytics-client";

interface HeroProps {
  campaign: CampaignHeadline;
}

export const Hero: React.FC<HeroProps> = ({ campaign }) => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge-wrap">
            <span className="badge">{campaign.badge}</span>
          </div>

          <h1 className="hero-title">
            {campaign.headline}
          </h1>

          <p className="hero-subtitle">
            {campaign.subheadline}
          </p>

          {/* Quick value upfront cards preview */}
          <div className="hero-preview-cards">
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

          <div className="hero-ctas">
            <a
              href="#srovnani"
              className="btn-primary hero-cta-btn"
              id="hero-cta-compare"
            >
              {campaign.heroCta}
            </a>

            <a
              href="#ziskat-prehled"
              className="btn-secondary hero-cta-btn"
              id="hero-cta-checklist"
              onClick={() => trackEvent("lead_cta_clicked", { ctaLocation: "hero" })}
            >
              Získat srovnání a kontrolní seznam
            </a>
          </div>

          <p className="hero-trust-text">
            ✓ Ověřená data z NYSE Arca &bull; Bez registrace k okamžitému zobrazení &bull; Vzdělávací přehled
          </p>
        </div>
      </div>
    </section>
  );
};
