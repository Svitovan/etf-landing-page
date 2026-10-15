import { describe, expect, it } from "vitest";
import dataset from "../data/etfs.json";
import { validateEtfDataset } from "../scripts/validate-data";
import type { EtfDataset } from "../src/types/etf";

describe("Investor-context provenance contract", () => {
  it("accepts the reviewed dataset without changing the original fund snapshot", () => {
    expect(validateEtfDataset(dataset as unknown as EtfDataset).success).toBe(true);
    expect(dataset.version).toBe("2026-10-11");
  });
  it("rejects a tax statement without supporting evidence", () => {
    const copy = structuredClone(dataset);
    copy.investorContext.dividendTreaty.evidence = [];
    expect(validateEtfDataset(copy as unknown as EtfDataset).success).toBe(false);
  });
  it("rejects a third-party article presented as primary regulatory evidence", () => {
    const copy = structuredClone(dataset);
    copy.investorContext.priips.evidence[0].url = "https://example.com/blog/priips";
    expect(validateEtfDataset(copy as unknown as EtfDataset).success).toBe(false);
  });
  it("rejects an untraceable statement even if its URL looks authoritative", () => {
    const copy = structuredClone(dataset);
    copy.investorContext.w8ben.evidence[0].note = "";
    expect(validateEtfDataset(copy as unknown as EtfDataset).success).toBe(false);
  });
});
