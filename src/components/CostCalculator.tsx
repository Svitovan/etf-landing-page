"use client";

import React, { useState, useId } from "react";
import { EtfRecord } from "../types/etf";
import {
  calculateComparison,
  parseCzkInput,
  formatCzk,
  DEFAULT_POSITION_CZK,
} from "../lib/calculations";

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
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 800,
                color: "var(--text-main)",
                letterSpacing: "-0.02em",
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              Kolik znamenají poplatky fondu v reálných korunách?
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Zadejte orientační hodnotu své investice a podívejte se na roční náklady jednotlivých ETF.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-light)",
              padding: "1.75rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {/* Input field */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                htmlFor={inputId}
                style={{
                  display: "block",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "var(--text-main)",
                  marginBottom: "0.5rem",
                }}
              >
                Hodnota investované částky v Kč:
              </label>

              <div style={{ position: "relative" }}>
                <input
                  id={inputId}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  aria-invalid={errorMsg ? "true" : "false"}
                  aria-describedby={errorMsg ? `${inputId}-error` : undefined}
                  style={{
                    width: "100%",
                    minHeight: "48px",
                    padding: "0.75rem 1rem",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${errorMsg ? "var(--color-error)" : "var(--border-light)"}`,
                    backgroundColor: "var(--bg-page)",
                    color: "var(--text-main)",
                  }}
                />
              </div>

              {errorMsg && (
                <div
                  id={`${inputId}-error`}
                  role="alert"
                  style={{
                    color: "var(--color-error)",
                    fontSize: "0.85rem",
                    marginTop: "0.4rem",
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
                marginBottom: "1.5rem",
              }}
            >
              <span style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>Rychlá volba:</span>
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePresetClick(p)}
                  style={{
                    padding: "0.3rem 0.65rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-light)",
                    backgroundColor: positionCzk === p ? "var(--bg-accent-subtle)" : "var(--bg-page)",
                    color: positionCzk === p ? "var(--accent)" : "var(--text-muted)",
                    fontWeight: positionCzk === p ? 700 : 500,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  {formatCzk(p)}
                </button>
              ))}
            </div>

            {/* Live Calculation Results */}
            <div
              style={{
                backgroundColor: "var(--bg-page)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                marginBottom: "1.25rem",
                border: "1px solid var(--border-light)",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  marginBottom: "0.85rem",
                }}
              >
                Orientační roční náklady fondů při hodnotě {formatCzk(positionCzk)}:
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.75rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>VOO (0,03 %)</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent)" }}>
                    {formatCzk(comparison.costs["VOO"]?.annualCostCzk ?? 0, true)}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-light)" }}>ročně</div>
                </div>

                <div
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>IVV (0,03 %)</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--accent)" }}>
                    {formatCzk(comparison.costs["IVV"]?.annualCostCzk ?? 0, true)}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-light)" }}>ročně</div>
                </div>

                <div
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    padding: "0.75rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>SPY (0,0945 %)</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-warning)" }}>
                    {formatCzk(comparison.costs["SPY"]?.annualCostCzk ?? 0, true)}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-light)" }}>ročně</div>
                </div>
              </div>

              {/* Difference highlight */}
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  backgroundColor: "var(--bg-surface)",
                  borderRadius: "var(--radius-sm)",
                  borderLeft: "4px solid var(--accent)",
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                }}
              >
                <strong>Rozdíl v nákladech: </strong>
                U SPY zaplatíte orientačně o{" "}
                <span style={{ fontWeight: 700, color: "var(--color-warning)" }}>
                  {formatCzk(comparison.maxDifferenceCzk, true)} ročně
                </span>{" "}
                více než u VOO / IVV. Za 10 let činí rozdíl cca{" "}
                <strong>{formatCzk(comparison.maxDifferenceCzk * 10, true)}</strong> (při neměnné hodnotě pozice).
              </div>
            </div>

            {/* Disclaimer */}
            <p
              style={{
                fontSize: "0.76rem",
                color: "var(--text-light)",
                lineHeight: 1.45,
                marginBottom: "1.25rem",
              }}
            >
              * Výpočet má výhradně ilustrativní charakter a počítá s průběžným nákladem na správu fondu (Expense Ratio). Nezahrnuje poplatky brokera, spread, konverzi CZK/USD ani daňové dopady.
            </p>

            {/* Contextual CTA */}
            <div style={{ textAlign: "center" }}>
              <a
                href="#ziskat-prehled"
                className="btn-primary"
                style={{ width: "100%", maxWidth: "380px" }}
                id="calculator-cta-to-form"
              >
                Uložit srovnání + kontrolní seznam
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
