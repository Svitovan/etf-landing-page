import React from "react";
import { CampaignHeadline } from "../data/campaign-copy";
import { trackEvent } from "../lib/analytics-client";
import type { EtfRecord } from "../types/etf";
import { formatExpenseRatio } from "../lib/calculations";

interface HeroProps {
  campaign: CampaignHeadline;
  etfs: EtfRecord[];
}

export const Hero: React.FC<HeroProps> = ({ campaign, etfs }) => {
  const highestRate = Math.max(...etfs.map(etf => etf.expenseRatio.value.rate));
  const lowestRate = Math.min(...etfs.map(etf => etf.expenseRatio.value.rate));
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
            {etfs.map((etf, index) => (
              <div key={etf.id} style={{
                textAlign: "center", minWidth: 0,
                borderLeft: index > 0 ? "1px solid var(--border-light)" : undefined,
              }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-light)", fontWeight: 600 }}>
                  {etf.ticker.value}
                </div>
                <div className="tabular-nums" style={{
                  fontSize: "1.1rem", fontWeight: 700,
                  color: highestRate > lowestRate && etf.expenseRatio.value.rate === highestRate ? "var(--color-warning)" : "var(--accent)",
                }}>
                  {formatExpenseRatio(etf.expenseRatio.value)}
                </div>
                <div title={etf.issuer.value} style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {etf.issuer.value}
                </div>
              </div>
            ))}
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
