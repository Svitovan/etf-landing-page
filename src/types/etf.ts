export interface Evidence {
  url: string;
  title: string;
  asOf: string | null;
  checkedAt: string;
  note?: string;
}

export interface VerifiedValue<T> {
  value: T;
  evidence: Evidence[];
}

export interface EtfExpenseRatio {
  rate: number; // e.g. 0.0003 for 0.03%
  displayPercent: string;
  kind: "gross" | "net";
}

export interface EtfRecord {
  id: string;
  ticker: VerifiedValue<string>;
  name: VerifiedValue<string>;
  issuer: VerifiedValue<string>;
  exchange: VerifiedValue<string>;
  benchmark: VerifiedValue<string>;
  expenseRatio: VerifiedValue<EtfExpenseRatio>;
  tradingCurrency: VerifiedValue<string>;
  domicile: VerifiedValue<string>;
  distributionPolicy: VerifiedValue<string> | null;
  structure?: VerifiedValue<string>;
  availability: {
    status: "verified-conditional" | "not-verified";
    explanationCs: string;
    evidence: Evidence[];
  };
}

export interface EtfDataset {
  version: string;
  updatedAt: string;
  etfs: EtfRecord[];
  investorContext: InvestorContext;
}

export interface InvestorContext {
  reviewedAt: string;
  priips: VerifiedValue<string>;
  kidDefinition: VerifiedValue<string>;
  dividendTreaty: VerifiedValue<string>;
  w8ben: VerifiedValue<string>;
  withholding: VerifiedValue<string>;
}

export interface CostCalculationResult {
  positionValueCzk: number;
  costs: Record<string, {
    ticker: string;
    name: string;
    rate: number;
    annualCostCzk: number;
  }>;
  maxDifferenceCzk: number;
  cheapestTickers: string[];
  mostExpensiveTicker: string;
}
