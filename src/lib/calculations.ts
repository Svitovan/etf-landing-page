import { EtfRecord, CostCalculationResult } from "../types/etf";

export const MIN_POSITION_CZK = 1_000;
export const MAX_POSITION_CZK = 10_000_000;
export const DEFAULT_POSITION_CZK = 100_000;

/**
 * Calculates the illustrative annual fund management cost in CZK.
 * Does not include broker fees, FX conversion, spreads, or taxes.
 */
export function calculateAnnualCost(positionValueCzk: number, rate: number): number {
  if (!Number.isFinite(positionValueCzk) || positionValueCzk < 0) {
    return 0;
  }
  if (!Number.isFinite(rate) || rate < 0) {
    return 0;
  }
  const raw = positionValueCzk * rate;
  // Round to 4 decimal places to prevent IEEE 754 floating point inaccuracies (e.g. 100000 * 0.0003 = 29.999999999999996)
  return Math.round(raw * 10000) / 10000;
}

/**
 * Computes comparative costs for all provided ETFs.
 */
export function calculateComparison(
  positionValueCzk: number,
  etfs: EtfRecord[]
): CostCalculationResult {
  const costs: CostCalculationResult["costs"] = {};
  let minCost = Infinity;
  let maxCost = -Infinity;
  let cheapestTickers: string[] = [];
  let mostExpensiveTicker = "";

  for (const etf of etfs) {
    const ticker = etf.ticker.value;
    const rate = etf.expenseRatio.value.rate;
    const annualCostCzk = calculateAnnualCost(positionValueCzk, rate);

    costs[ticker] = {
      ticker,
      name: etf.name.value,
      rate,
      annualCostCzk,
    };

    if (annualCostCzk < minCost) {
      minCost = annualCostCzk;
      cheapestTickers = [ticker];
    } else if (Math.abs(annualCostCzk - minCost) < 0.0001) {
      cheapestTickers.push(ticker);
    }

    if (annualCostCzk > maxCost) {
      maxCost = annualCostCzk;
      mostExpensiveTicker = ticker;
    }
  }

  const maxDifferenceCzk = maxCost > minCost ? maxCost - minCost : 0;

  return {
    positionValueCzk,
    costs,
    maxDifferenceCzk,
    cheapestTickers,
    mostExpensiveTicker,
  };
}

/**
 * Robustly parses user input for CZK amounts.
 * Supports spaces (e.g. "100 000"), Czech comma as decimal separator, and handles edge cases.
 */
export function parseCzkInput(raw: string | number): {
  value: number | null;
  error?: string;
} {
  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || Number.isNaN(raw)) {
      return { value: null, error: "Zadejte platnou částku v Kč." };
    }
    if (raw < MIN_POSITION_CZK) {
      return {
        value: null,
        error: `Minimální částka pro kalkulačku je ${formatCzk(MIN_POSITION_CZK)}.`,
      };
    }
    if (raw > MAX_POSITION_CZK) {
      return {
        value: null,
        error: `Maximální částka pro kalkulačku je ${formatCzk(MAX_POSITION_CZK)}.`,
      };
    }
    return { value: raw };
  }

  if (typeof raw !== "string") {
    return { value: null, error: "Zadejte částku v Kč." };
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return { value: null, error: "Zadejte prosím částku." };
  }

  // Remove spaces and non-breaking spaces
  const sanitized = trimmed.replace(/[\s\u00A0]/g, "").replace(",", ".");

  const num = Number(sanitized);

  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return { value: null, error: "Zadaná hodnota není platné číslo." };
  }

  if (num < 0) {
    return { value: null, error: "Částka nemůže být záporná." };
  }

  if (num < MIN_POSITION_CZK) {
    return {
      value: null,
      error: `Minimální částka pro kalkulačku je ${formatCzk(MIN_POSITION_CZK)}.`,
    };
  }

  if (num > MAX_POSITION_CZK) {
    return {
      value: null,
      error: `Maximální částka pro kalkulačku je ${formatCzk(MAX_POSITION_CZK)}.`,
    };
  }

  return { value: num };
}

/**
 * Formats a CZK amount using standard Czech locale formatting.
 */
export function formatCzk(amount: number, showDecimals = false): string {
  const fractionDigits = showDecimals ? 2 : (amount % 1 === 0 ? 0 : 2);
  const formatter = new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return formatter.format(amount);
}

/**
 * Formats an expense ratio rate as percent string (e.g. 0.0003 -> "0,03 %").
 */
export function formatPercent(rate: number): string {
  const formatter = new Intl.NumberFormat("cs-CZ", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
  return formatter.format(rate);
}
