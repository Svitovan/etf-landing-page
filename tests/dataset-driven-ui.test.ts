import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Keep the legacy displayPercent deliberately stale and change the rate ranking.
// This fixture must never be written to data/etfs.json or submitted to a backend.
vi.mock("../data/etfs.json", async original => {
  const source = await original<{ default: typeof import("../data/etfs.json") }>();
  const data = structuredClone(source.default);
  [0.0021, 0.0017, 0.0004].forEach((rate, index) => { data.etfs[index].expenseRatio.value.rate = rate; });
  data.etfs[0].expenseRatio.value.kind = "gross";
  data.etfs[0].issuer.value = "Fixture issuer";
  data.etfs[0].exchange.value = "Fixture exchange";
  data.etfs[0].tradingCurrency.value = "EUR";
  data.etfs[0].distributionPolicy.value = "Fixture distribution";
  return { ...source, default: data };
});

import dataset from "../data/etfs.json";
import type { EtfRecord } from "../src/types/etf";
import { Hero } from "../src/components/Hero";
import { CostCalculator } from "../src/components/CostCalculator";
import { EtfComparison } from "../src/components/EtfComparison";
import { SourcesFaq } from "../src/components/SourcesFaq";
import ReportPage from "../src/app/report/page";
import { DEFAULT_COPY } from "../src/data/campaign-copy";

const etfs = dataset.etfs as unknown as EtfRecord[];
const text = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

describe("UI follows a changed dataset rather than copied financial values", () => {
  it.each([
    { name: "Hero", render: () => React.createElement(Hero, { campaign: DEFAULT_COPY, etfs }) },
    { name: "calculator", render: () => React.createElement(CostCalculator, { etfs }) },
    { name: "comparison", render: () => React.createElement(EtfComparison, { etfs, investorContext: dataset.investorContext }) },
    { name: "FAQ", render: () => React.createElement(SourcesFaq, { etfs, context: dataset.investorContext }) },
    { name: "report", render: () => ReportPage({ searchParams: Promise.resolve({ amount: "100000", etfs: "VOO" }) }) },
  ])("updates all percentage labels in $name", async ({ render }) => {
    const visible = text(renderToStaticMarkup(await render()));
    expect(visible).toContain("0,21 %");
    expect(visible).toContain("0,17 %");
    expect(visible).toContain("0,04 %");
    expect(visible).not.toContain("0,03 %");
    expect(visible).not.toContain("0,0945 %");
  });
  it.each([
    { name: "calculator", render: () => React.createElement(CostCalculator, { etfs }) },
    { name: "report", render: () => ReportPage({ searchParams: Promise.resolve({ amount: "100000", etfs: "VOO" }) }) },
  ])("updates annual costs and the ten-year difference in $name", async ({ render }) => {
    const visible = text(renderToStaticMarkup(await render()));
    for (const expected of ["210,00 Kč", "170,00 Kč", "40,00 Kč", "1 700,00 Kč"]) expect(visible).toContain(expected);
    expect(visible).not.toContain("VOO/IVV a SPY");
  });
  it("report reads issuer, exchange, currency, distributions and kind from its dataset", async () => {
    const visible = text(renderToStaticMarkup(await ReportPage({ searchParams: Promise.resolve({ etfs: "VOO,VOO,VOO" }) })));
    for (const expected of ["Fixture issuer", "Fixture exchange", "EUR / USA", "Fixture distribution", "0,21 % (Gross)", "Váš vybraný fond:"]) {
      expect(visible).toContain(expected);
    }
  });
  it("moves the highest-cost warning from SPY to VOO when their ranking changes", () => {
    const html = renderToStaticMarkup(React.createElement(CostCalculator, { etfs }));
    const warnedAmount = html.match(/class="tabular-nums"[^>]*color:var\(--color-warning\)[^>]*>([^<]+)/)?.[1];
    expect(warnedAmount?.replace(/\s+/g, " ")).toContain("210,00 Kč");
  });
});
