"use client";

import React, { useState, useEffect, useRef } from "react";
import { EtfRecord } from "../types/etf";
import { trackEvent } from "../lib/analytics-client";

interface EtfComparisonProps {
  etfs: EtfRecord[];
  onSelectEtfs?: (selectedTickers: string[]) => void;
}

export const EtfComparison: React.FC<EtfComparisonProps> = ({ etfs, onSelectEtfs }) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showSources, setShowSources] = useState<boolean>(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const hasTrackedViewRef = useRef<boolean>(false);

  useEffect(() => {
    if (!hasTrackedViewRef.current) {
      hasTrackedViewRef.current = true;
      trackEvent("comparison_viewed", {
        selectedEtfs: activeTab === "all" ? "VOO,IVV,SPY" : activeTab.toUpperCase(),
      });
    }
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onSelectEtfs) {
      if (tabId === "all") {
        onSelectEtfs(["VOO", "IVV", "SPY"]);
      } else {
        const found = etfs.find((e) => e.id === tabId);
        onSelectEtfs(found ? [found.ticker.value] : ["VOO", "IVV", "SPY"]);
      }
    }
  };

  const toggleCardDetails = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredEtfs = etfs.filter(
    (e) => activeTab === "all" || e.id === activeTab
  );

  return (
    <section
      id="srovnani"
      style={{
        paddingTop: "2.5rem",
        paddingBottom: "2.5rem",
        backgroundColor: "var(--bg-surface)",
        borderTop: "1px solid var(--border-light)",
        borderBottom: "1px solid var(--border-light)",
      }}
    >
      <div className="container">
        <div style={{ marginBottom: "1.5rem" }}>
          <span className="badge">1. Krok: Přehledné srovnání</span>
          <h2
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.1rem)",
              fontWeight: 500,
              fontFamily: "var(--font-serif)",
              color: "var(--text-main)",
              letterSpacing: "-0.015em",
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            Srovnání VOO, IVV a SPY na NYSE Arca
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.55 }}>
            Všechny tři fondy drží stejné akcie z indexu S&amp;P 500. Zde vidíte jejich parametry podložené oficiálními prospekty bez marketingového zkreslení.
          </p>
        </div>

        {/* Broker Availability Alert Notice */}
        <div
          style={{
            backgroundColor: "var(--color-warning-bg)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1.25rem",
            display: "flex",
            gap: "0.75rem",
            alignItems: "flex-start",
          }}
        >
          <span
            style={{
              color: "var(--color-warning)",
              fontSize: "1.25rem",
              lineHeight: 1,
              marginTop: "0.1rem",
            }}
          >
            ⓘ
          </span>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-main)",
              lineHeight: 1.5,
            }}
          >
            <strong>Dostupnost u konkrétního brokera nebyla ověřena.</strong> Ověřte si ji před nákupem. Podle evropské regulace PRIIPs vyžadují čeští brokeři pro retailové nákupy dokument klíčových informací (KID) v češtině.
          </div>
        </div>

        {/* Tab Filter */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.25rem",
            overflowX: "auto",
            paddingBottom: "0.25rem",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <button
            type="button"
            onClick={() => handleTabChange("all")}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              border: "1px solid",
              borderColor: activeTab === "all" ? "var(--accent)" : "var(--border-light)",
              backgroundColor: activeTab === "all" ? "var(--accent)" : "var(--bg-surface)",
              color: activeTab === "all" ? "#ffffff" : "var(--text-main)",
              cursor: "pointer",
            }}
          >
            Všechny 3 fondy
          </button>
          {etfs.map((etf) => (
            <button
              key={etf.id}
              type="button"
              onClick={() => handleTabChange(etf.id)}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.85rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                border: "1px solid",
                borderColor: activeTab === etf.id ? "var(--accent)" : "var(--border-light)",
                backgroundColor: activeTab === etf.id ? "var(--accent)" : "var(--bg-surface)",
                color: activeTab === etf.id ? "#ffffff" : "var(--text-main)",
                cursor: "pointer",
              }}
            >
              {etf.ticker.value}
            </button>
          ))}
        </div>

        {/* Responsive Cards Grid */}
        <div className="etf-comparison-grid" style={{ marginBottom: "1.5rem" }}>
          {filteredEtfs.map((etf) => {
            const isSpy = etf.id === "spy";
            const isExpanded = !!expandedCards[etf.id];

            return (
              <article
                key={etf.id}
                style={{
                  backgroundColor: "var(--bg-page)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-light)",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  boxShadow: "var(--shadow-sm)",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: "var(--bg-accent-subtle)",
                        color: "var(--accent)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      NYSE Arca · {etf.tradingCurrency.value}
                    </span>
                    <h3
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "var(--text-main)",
                        marginTop: "0.25rem",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {etf.ticker.value}
                    </h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      className="tabular-nums"
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 800,
                        color: isSpy ? "var(--color-warning)" : "var(--accent)",
                        display: "block",
                        lineHeight: 1.1,
                      }}
                    >
                      {etf.expenseRatio.value.displayPercent}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-light)" }}>
                      ročně (gross)
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--text-main)",
                    marginBottom: "0.85rem",
                    lineHeight: 1.3,
                  }}
                >
                  {etf.name.value}
                </div>

                {/* Primary metrics list */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                    marginBottom: "0.85rem",
                    fontSize: "0.84rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.35rem 0.6rem",
                      backgroundColor: "var(--bg-surface)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <span style={{ color: "var(--text-light)" }}>Benchmark</span>
                    <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                      {etf.benchmark.value}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.35rem 0.6rem",
                      backgroundColor: "var(--bg-surface)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <span style={{ color: "var(--text-light)" }}>Roční provozní náklady</span>
                    <span
                      className="tabular-nums"
                      style={{ fontWeight: 700, color: "var(--text-main)" }}
                    >
                      {etf.expenseRatio.value.displayPercent} p.a.
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-light)",
                      fontStyle: "italic",
                      padding: "0 0.2rem",
                      lineHeight: 1.35,
                    }}
                  >
                    Roční provozní náklady fondu před případnými úlevami.
                  </p>
                </div>

                {/* Accordion toggle button */}
                <button
                  type="button"
                  onClick={() => toggleCardDetails(etf.id)}
                  aria-expanded={isExpanded}
                  style={{
                    width: "100%",
                    minHeight: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--text-main)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>Právní struktura, emitent a dividendy</span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      transition: "transform 0.2s ease",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▼
                  </span>
                </button>

                {/* Accordion expanded content */}
                {isExpanded && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.45rem",
                      marginTop: "0.6rem",
                      fontSize: "0.82rem",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.45rem 0.6rem",
                        backgroundColor: "var(--bg-surface)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <div style={{ color: "var(--text-light)", fontSize: "0.72rem" }}>
                        Právní emitent
                      </div>
                      <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {etf.issuer.value}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "0.45rem 0.6rem",
                        backgroundColor: "var(--bg-surface)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <div style={{ color: "var(--text-light)", fontSize: "0.72rem" }}>
                        Právní struktura
                      </div>
                      <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {etf.structure?.value || "Investment Company"}
                      </div>
                      {etf.structure?.evidence[0]?.note && (
                        <div
                          style={{
                            fontSize: "0.74rem",
                            color: "var(--text-muted)",
                            marginTop: "0.25rem",
                            lineHeight: 1.35,
                          }}
                        >
                          {etf.structure.evidence[0].note}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.35rem 0.6rem",
                        backgroundColor: "var(--bg-surface)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <span style={{ color: "var(--text-light)" }}>Domicil</span>
                      <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {etf.domicile.value}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.35rem 0.6rem",
                        backgroundColor: "var(--bg-surface)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <span style={{ color: "var(--text-light)" }}>Výplata dividend</span>
                      <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {etf.distributionPolicy?.value || "Kvartální výplata"}
                      </span>
                    </div>

                    <div
                      style={{
                        padding: "0.45rem 0.6rem",
                        backgroundColor: "var(--bg-subtle)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                        lineHeight: 1.4,
                      }}
                    >
                      <div>
                        <strong>Zdroj:</strong> {etf.expenseRatio.evidence[0]?.title} (k {etf.expenseRatio.evidence[0]?.asOf || "neuvedeno"})
                      </div>
                      <div>
                        <strong>Ověřeno:</strong> 11. 10. 2026
                      </div>
                    </div>
                  </div>
                )}

                {/* Availability in CR */}
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      padding: "0.6rem 0.75rem",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border-light)",
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      lineHeight: 1.4,
                    }}
                  >
                    <strong style={{ color: "var(--text-main)" }}>Dostupnost v ČR: </strong>
                    {etf.availability.explanationCs}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Toggle sources section */}
        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setShowSources(!showSources)}
            className="btn-secondary"
            style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
          >
            {showSources
              ? "Skrýt primární zdroje a data"
              : "Zobrazit primární zdroje a auditované odkazy"}
          </button>
        </div>

        {showSources && (
          <div
            style={{
              marginTop: "1.25rem",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-page)",
              border: "1px solid var(--border-light)",
              fontSize: "0.8rem",
            }}
          >
            <h4 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
              Ověření dat z prospektů (verze datasetu: 2026-10-11):
            </h4>
            <ul style={{ paddingLeft: "1.2rem", lineHeight: 1.6 }}>
              {etfs.map((e) => (
                <li key={e.id}>
                  <strong>{e.ticker.value}: </strong>
                  Expense ratio {e.expenseRatio.value.displayPercent} ({e.expenseRatio.value.kind}) &ndash;{" "}
                  <a
                    href={e.expenseRatio.evidence[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {e.expenseRatio.evidence[0].title}
                  </a>{" "}
                  (platnost k: {e.expenseRatio.evidence[0].asOf || "uvedeno v prospektu"})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
