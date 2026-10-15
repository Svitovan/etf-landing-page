"use client";

import React, { useState, useId } from "react";
import { EtfRecord } from "../types/etf";
import {
  calculateComparison,
  parseCzkInput,
  formatCzk,
  DEFAULT_POSITION_CZK,
} from "../lib/calculations";
import { trackEvent } from "../lib/analytics-client";

interface CostCalculatorProps {
  etfs: EtfRecord[];
  onCalculationChange?: (value: number) => void;
}

const PRESETS = [50_000, 100_000, 250_000, 500_000, 1_000_000];

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  etfs,
  onCalculationChange,
}) => {
  const [inputValue, setInputValue] = useState<string>("100 000");
  const [positionCzk, setPositionCzk] = useState<number>(DEFAULT_POSITION_CZK);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputId = useId();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const parsed = parseCzkInput(val);
    if (parsed.value !== null) {
      setPositionCzk(parsed.value);
      setErrorMsg(null);
      onCalculationChange?.(parsed.value);
    } else {
      setErrorMsg(parsed.error || "Neplatná částka");
    }
  };

  const handlePresetClick = (amount: number) => {
    setPositionCzk(amount);
    setInputValue(new Intl.NumberFormat("cs-CZ").format(amount));
    setErrorMsg(null);
    onCalculationChange?.(amount);
  };

  const comparison = calculateComparison(positionCzk, etfs);

  return (
    <section
      id="kalkulacka"
      style={{
        paddingTop: "2.5rem",
        paddingBottom: "2.5rem",
        backgroundColor: "var(--bg-page)",
      }}
    >
      <div className="container">
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <span className="badge">2. Krok: Přepočet nákladů na koruny</span>
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
              Kolik znamenají náklady v korunách?
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Přepočet procentního ukazatele TER na orientační roční částku v CZK.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-light)",
              padding: "1.25rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {/* Input field */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor={inputId}
                style={{
                  display: "block",
                  fontWeight: 600,
                  fontSize: "0.92rem",
                  color: "var(--text-main)",
                  marginBottom: "0.4rem",
                }}
              >
                Orientační hodnota investice v Kč
              </label>

              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  id={inputId}
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={handleInputChange}
                  aria-invalid={errorMsg ? "true" : "false"}
                  aria-describedby={errorMsg ? `${inputId}-error` : undefined}
                  style={{
                    width: "100%",
                    minHeight: "48px",
                    padding: "0.75rem 3.5rem 0.75rem 1rem",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${errorMsg ? "var(--color-error)" : "var(--border-light)"}`,
                    backgroundColor: "var(--bg-page)",
                    color: "var(--text-main)",
                    boxSizing: "border-box",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "1rem",
                    fontWeight: 600,
                    color: "var(--text-light)",
                    pointerEvents: "none",
                  }}
                >
                  Kč
                </span>
              </div>

              {errorMsg && (
                <div
                  id={`${inputId}-error`}
                  role="alert"
                  style={{
                    color: "var(--color-error)",
                    fontSize: "0.82rem",
                    marginTop: "0.35rem",
                    fontWeight: 500,
                  }}
                >
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Presets */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.4rem",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <span style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>Rychlá volba:</span>
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePresetClick(p)}
                  style={{
                    padding: "0.35rem 0.65rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-light)",
                    backgroundColor: positionCzk === p ? "var(--accent)" : "var(--bg-page)",
                    color: positionCzk === p ? "#ffffff" : "var(--text-main)",
                    fontWeight: positionCzk === p ? 700 : 500,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {formatCzk(p)}
                </button>
              ))}
            </div>

            {/* Live Calculation Results (Clean responsive rows to prevent mobile overflow) */}
            <div
              style={{
                backgroundColor: "var(--bg-page)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                marginBottom: "1.25rem",
                border: "1px solid var(--border-light)",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginBottom: "0.75rem",
                }}
              >
                Orientační roční náklady fondů při hodnotě {formatCzk(positionCzk)}:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {/* VOO */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.95rem" }}>
                      VOO
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>
                      (0,03 %)
                    </span>
                  </div>
                  <div
                    className="tabular-nums"
                    style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--accent)" }}
                  >
                    {formatCzk(comparison.costs["VOO"]?.annualCostCzk ?? 0, true)} / rok
                  </div>
                </div>

                {/* IVV */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.95rem" }}>
                      IVV
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>
                      (0,03 %)
                    </span>
                  </div>
                  <div
                    className="tabular-nums"
                    style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--accent)" }}
                  >
                    {formatCzk(comparison.costs["IVV"]?.annualCostCzk ?? 0, true)} / rok
                  </div>
                </div>

                {/* SPY */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0.75rem",
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.95rem" }}>
                      SPY
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>
                      (0,0945 %)
                    </span>
                  </div>
                  <div
                    className="tabular-nums"
                    style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--color-warning)" }}
                  >
                    {formatCzk(comparison.costs["SPY"]?.annualCostCzk ?? 0, true)} / rok
                  </div>
                </div>
              </div>

              {/* Difference highlight */}
              <div
                style={{
                  marginTop: "0.85rem",
                  padding: "0.75rem",
                  backgroundColor: "var(--bg-surface)",
                  borderRadius: "var(--radius-sm)",
                  borderLeft: "4px solid var(--accent)",
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  lineHeight: 1.45,
                }}
              >
                Rozdíl mezi VOO/IVV a SPY činí přibližně{" "}
                <strong style={{ color: "var(--accent)" }}>
                  {formatCzk(comparison.maxDifferenceCzk, true)} ročně
                </strong>{" "}
                při zvolené investici {formatCzk(positionCzk)}. Za 10 let činí orientační rozdíl{" "}
                <strong>{formatCzk(comparison.maxDifferenceCzk * 10, true)}</strong> (při neměnné hodnotě pozice).
              </div>
            </div>

            {/* Methodological Disclaimers from Stitch specification */}
            <div
              style={{
                fontSize: "0.76rem",
                color: "var(--text-light)",
                lineHeight: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                marginBottom: "1.25rem",
              }}
            >
              <p>
                • <strong>Ilustrační výpočet</strong> při neměnné hodnotě investice. Nejde o odhad výnosu ani samostatný poplatek účtovaný brokerem.
              </p>
              <p>
                • Nezahrnuje poplatky brokera, spread, směnu měn, daně ani změnu hodnoty investice. Částka v Kč neznamená, že se ETF obchoduje v korunách.
              </p>
              <p style={{ color: "var(--text-muted)", fontWeight: 600 }}>
                • Nižší náklady samy o sobě neznamenají vhodnější fond.
              </p>
            </div>

            {/* Contextual CTA */}
            <div style={{ textAlign: "center" }}>
              <a
                href="#ziskat-prehled"
                className="btn-primary"
                style={{ width: "100%", maxWidth: "380px", justifyContent: "center" }}
                id="calculator-cta-to-form"
                onClick={() => trackEvent("lead_cta_clicked", { ctaLocation: "calculator" })}
              >
                Získat srovnání a kontrolní seznam
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
