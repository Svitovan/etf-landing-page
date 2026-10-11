import { describe, it, expect } from "vitest";
import {
  calculateAnnualCost,
  calculateComparison,
  parseCzkInput,
  formatCzk,
  MIN_POSITION_CZK,
  MAX_POSITION_CZK,
} from "../src/lib/calculations";
import etfData from "../data/etfs.json";
import { validateEtfDataset } from "../scripts/validate-data";
import { EtfDataset } from "../src/types/etf";

describe("T01: ETF Dataset Schema and Integrity", () => {
  it("validates data/etfs.json with zero errors", () => {
    const result = validateEtfDataset(etfData as unknown as EtfDataset);
    expect(result.errors).toEqual([]);
    expect(result.success).toBe(true);
  });

  it("contains exactly VOO, IVV, and SPY", () => {
    const tickers = etfData.etfs.map((e) => e.ticker.value);
    expect(tickers).toEqual(["VOO", "IVV", "SPY"]);
  });

  it("all ETFs are listed on NYSE Arca", () => {
    for (const etf of etfData.etfs) {
      expect(etf.exchange.value).toBe("NYSE Arca");
    }
  });
});

describe("T02: Calculation Control Examples (Section 6.3)", () => {
  it("calculates exactly 30 Kč for 100 000 Kč at 0.0003 rate (VOO/IVV)", () => {
    const cost = calculateAnnualCost(100_000, 0.0003);
    expect(cost).toBe(30);
  });

  it("calculates exactly 94.50 Kč for 100 000 Kč at 0.000945 rate (SPY)", () => {
    const cost = calculateAnnualCost(100_000, 0.000945);
    expect(cost).toBeCloseTo(94.5, 4);
  });

  it("calculates exact difference of 64.50 Kč between SPY and VOO/IVV for 100 000 Kč", () => {
    const spyCost = calculateAnnualCost(100_000, 0.000945);
    const vooCost = calculateAnnualCost(100_000, 0.0003);
    expect(spyCost - vooCost).toBeCloseTo(64.5, 4);
  });

  it("calculates comparison result object accurately for the whole dataset", () => {
    const result = calculateComparison(100_000, etfData.etfs as any);
    expect(result.positionValueCzk).toBe(100_000);
    expect(result.costs["VOO"].annualCostCzk).toBe(30);
    expect(result.costs["IVV"].annualCostCzk).toBe(30);
    expect(result.costs["SPY"].annualCostCzk).toBeCloseTo(94.5, 4);
    expect(result.maxDifferenceCzk).toBeCloseTo(64.5, 4);
    expect(result.cheapestTickers).toEqual(["VOO", "IVV"]);
    expect(result.mostExpensiveTicker).toBe("SPY");
  });
});

describe("T03: Input Parsing, Spaces, Comma, and Bounds", () => {
  it("parses numbers formatted with spaces (e.g. '100 000')", () => {
    const res = parseCzkInput("100 000");
    expect(res.value).toBe(100_000);
    expect(res.error).toBeUndefined();
  });

  it("parses numbers formatted with non-breaking spaces", () => {
    const res = parseCzkInput("250\u00A0000");
    expect(res.value).toBe(250_000);
    expect(res.error).toBeUndefined();
  });

  it("parses numbers with Czech decimal comma (e.g. '50000,50')", () => {
    const res = parseCzkInput("50000,50");
    expect(res.value).toBe(50000.5);
  });

  it("rejects values below MIN_POSITION_CZK (1 000 Kč)", () => {
    const res = parseCzkInput("500");
    expect(res.value).toBeNull();
    expect(res.error).toBeDefined();
  });

  it("rejects values above MAX_POSITION_CZK (10 000 000 Kč)", () => {
    const res = parseCzkInput("10000001");
    expect(res.value).toBeNull();
    expect(res.error).toBeDefined();
  });

  it("rejects negative numbers", () => {
    const res = parseCzkInput("-50000");
    expect(res.value).toBeNull();
    expect(res.error).toBe("Částka nemůže být záporná.");
  });

  it("rejects non-numeric gibberish and empty strings", () => {
    expect(parseCzkInput("abc").value).toBeNull();
    expect(parseCzkInput("").value).toBeNull();
    expect(parseCzkInput("   ").value).toBeNull();
  });
});
