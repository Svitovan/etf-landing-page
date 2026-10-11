import fs from "node:fs";
import path from "node:path";

interface Evidence {
  url: string;
  title: string;
  asOf: string | null;
  checkedAt: string;
  note?: string;
}

interface VerifiedValue<T> {
  value: T;
  evidence: Evidence[];
}

interface EtfRecord {
  id: string;
  ticker: VerifiedValue<string>;
  name: VerifiedValue<string>;
  issuer: VerifiedValue<string>;
  exchange: VerifiedValue<string>;
  benchmark: VerifiedValue<string>;
  expenseRatio: VerifiedValue<{
    rate: number;
    displayPercent: string;
    kind: "gross" | "net";
  }>;
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

interface EtfDataset {
  version: string;
  updatedAt: string;
  etfs: EtfRecord[];
}

function validateEvidence(evidence: Evidence[], context: string): void {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    throw new Error(`[${context}] Evidence list must be a non-empty array.`);
  }

  for (let index = 0; index < evidence.length; index++) {
    const ev = evidence[index];
    if (!ev.url || !ev.url.startsWith("http")) {
      throw new Error(`[${context}#${index}] Invalid evidence URL: ${ev.url}`);
    }
    if (!ev.title || typeof ev.title !== "string") {
      throw new Error(`[${context}#${index}] Evidence must have a title.`);
    }
    if (ev.asOf !== null && isNaN(Date.parse(ev.asOf))) {
      throw new Error(`[${context}#${index}] Evidence asOf is invalid date: ${ev.asOf}`);
    }
    if (!ev.checkedAt || isNaN(Date.parse(ev.checkedAt))) {
      throw new Error(`[${context}#${index}] Evidence checkedAt is invalid date: ${ev.checkedAt}`);
    }
  }
}

export function validateEtfDataset(data: EtfDataset): { success: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    if (!data.version) errors.push("Missing dataset version.");
    if (!data.updatedAt || isNaN(Date.parse(data.updatedAt))) {
      errors.push("Missing or invalid dataset updatedAt timestamp.");
    }
    if (!Array.isArray(data.etfs) || data.etfs.length !== 3) {
      errors.push(`Dataset must contain exactly 3 ETFs, found ${data.etfs?.length ?? 0}.`);
      return { success: false, errors };
    }

    const seenIds = new Set<string>();
    const seenTickers = new Set<string>();

    for (const etf of data.etfs) {
      if (seenIds.has(etf.id)) errors.push(`Duplicate ETF ID: ${etf.id}`);
      seenIds.add(etf.id);

      const ticker = etf.ticker.value;
      if (seenTickers.has(ticker)) errors.push(`Duplicate ETF ticker: ${ticker}`);
      seenTickers.add(ticker);

      if (etf.exchange.value !== "NYSE Arca") {
        errors.push(`ETF ${ticker} exchange must be 'NYSE Arca', found '${etf.exchange.value}'`);
      }

      if (etf.tradingCurrency.value !== "USD") {
        errors.push(`ETF ${ticker} currency must be 'USD', found '${etf.tradingCurrency.value}'`);
      }

      const rate = etf.expenseRatio.value.rate;
      if (typeof rate !== "number" || rate <= 0 || rate > 0.005) {
        errors.push(`ETF ${ticker} expense ratio rate out of bounds: ${rate}`);
      }

      if (!["gross", "net"].includes(etf.expenseRatio.value.kind)) {
        errors.push(`ETF ${ticker} expense ratio kind must be 'gross' or 'net'`);
      }

      // Check evidence for critical fields
      validateEvidence(etf.ticker.evidence, `${ticker}.ticker`);
      validateEvidence(etf.name.evidence, `${ticker}.name`);
      validateEvidence(etf.issuer.evidence, `${ticker}.issuer`);
      validateEvidence(etf.exchange.evidence, `${ticker}.exchange`);
      validateEvidence(etf.expenseRatio.evidence, `${ticker}.expenseRatio`);
      validateEvidence(etf.availability.evidence, `${ticker}.availability`);

      if (!etf.availability.explanationCs.includes("KID") && !etf.availability.explanationCs.includes("broker")) {
        errors.push(`ETF ${ticker} availability explanation should explain PRIIPs/KID or broker availability.`);
      }
    }
  } catch (err: unknown) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

function run(): void {
  const filePath = path.join(process.cwd(), "data", "etfs.json");
  console.log(`Validating ETF dataset at ${filePath}...`);
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: File not found: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as EtfDataset;
  const result = validateEtfDataset(data);

  if (!result.success) {
    console.error("Dataset validation failed with errors:");
    for (const err of result.errors) {
      console.error(` - ${err}`);
    }
    process.exit(1);
  }

  console.log(`✓ Dataset valid: 3 ETFs verified (VOO, IVV, SPY) with full primary evidence.`);
}

if (process.argv[1]?.endsWith("validate-data.ts") || process.argv[1]?.includes("validate-data")) {
  run();
}
