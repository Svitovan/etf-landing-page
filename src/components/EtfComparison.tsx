"use client";

import React, { useState } from "react";
import { EtfRecord } from "../types/etf";

interface EtfComparisonProps {
  etfs: EtfRecord[];
  onSelectEtfs?: (selectedIds: string[]) => void;
}

export const EtfComparison: React.FC<EtfComparisonProps> = ({ etfs }) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showSources, setShowSources] = useState<boolean>(false);

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
        <div style={{ marginBottom: "1.75rem" }}>
          <span className="badge">1. Krok: Přehledné srovnání</span>
          <h2
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2rem)",
              fontWeight: 800,
              color: "var(--text-main)",
              letterSpacing: "-0.02em",
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            Srovnání VOO, IVV a SPY na NYSE Arca
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Všechny tři fondy drží stejné akcie z indexu S&amp;P 500. Zde vidíte jejich parametry podložené oficiálními prospekty.
          </p>
        </div>

        {/* Mobile Tab Filter */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.25rem",
            overflowX: "auto",
            paddingBottom: "0.25rem",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              fontWeight: 600,
              border: "1px solid",
              borderColor: activeTab === "all" ? "var(--accent)" : "var(--border-light)",
              backgroundColor: activeTab === "all" ? "var(--accent)" : "var(--bg-surface)",
              color: activeTab === "all" ? "#ffffff" : "var(--text-main)",
              cursor: "pointer",
            }}
          >
            Všechny 3 fondy vedle sebe
          </button>
          {etfs.map((etf) => (
            <button
              key={etf.id}
              type="button"
              onClick={() => setActiveTab(etf.id)}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.85rem",
                fontWeight: 600,
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

        {/* Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              activeTab === "all"
                ? "repeat(auto-fit, minmax(250px, 1fr))"
                : "1fr",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {etfs
            .filter((e) => activeTab === "all" || e.id === activeTab)
            .map((etf) => {
              const isSpy = etf.id === "spy";
              return (
                <div
                  key={etf.id}
                  style={{
                    backgroundColor: "var(--bg-page)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-light)",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
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
                      <h3
                        style={{
                          fontSize: "1.35rem",
                          fontWeight: 800,
                          color: "var(--text-main)",
                        }}
                      >
                        {etf.ticker.value}
                      </h3>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-muted)",
                          lineHeight: 1.3,
                        }}
                      >
                        {etf.name.value}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: isSpy ? "var(--color-warning-bg)" : "var(--bg-accent-subtle)",
                        color: isSpy ? "var(--color-warning)" : "var(--accent)",
                        fontWeight: 700,
                      }}
                    >
                      {etf.expenseRatio.value.displayPercent}
                    </span>
                  </div>

                  <dl
                    style={{
                      fontSize: "0.85rem",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.6rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <dt style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>Správce</dt>
                      <dd style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {etf.issuer.value}
                      </dd>
                    </div>

                    <div>
                      <dt style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>Burza</dt>
                      <dd style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {etf.exchange.value}
                      </dd>
                    </div>

                    <div>
                      <dt style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>Benchmark</dt>
                      <dd style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {etf.benchmark.value}
                      </dd>
                    </div>

                    <div>
                      <dt style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>Měna / Domicil</dt>
                      <dd style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {etf.tradingCurrency.value} / {etf.domicile.value}
                      </dd>
                    </div>

                    <div style={{ gridColumn: "span 2" }}>
                      <dt style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>Právní forma</dt>
                      <dd style={{ fontWeight: 500, color: "var(--text-muted)" }}>
                        {etf.structure?.value || "Investment Company"}
                      </dd>
                    </div>
                  </dl>

                  <div
                    style={{
                      marginTop: "auto",
                      padding: "0.65rem 0.75rem",
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
            {showSources ? "Skrýt primární zdroje a data" : "Zobrazit primární zdroje a auditované odkazy"}
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
