import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomePage from "../src/app/page";
import ReportPage from "../src/app/report/page";
import { CAMPAIGN_VARIANTS, DEFAULT_COPY } from "../src/data/campaign-copy";

describe("async page query compatibility", () => {
  it("resolves campaign parameters before rendering", async () => {
    const html = renderToStaticMarkup(await HomePage({ searchParams: Promise.resolve({ utm_content: "ad_b" }) }));
    expect(html).toContain(CAMPAIGN_VARIANTS.ad_b.headline);
  });
  it("ignores repeated campaign parameters safely", async () => {
    const html = renderToStaticMarkup(await HomePage({ searchParams: Promise.resolve({ utm_content: ["ad_a", "ad_b"] }) }));
    expect(html.replace(/&amp;/g, "&")).toContain(DEFAULT_COPY.headline);
  });
  it("does not throw for repeated amount/ETF parameters", async () => {
    const html = renderToStaticMarkup(await ReportPage({ searchParams: Promise.resolve({
      amount: ["250000", "500000"], etfs: ["IVV", "SPY"],
    }) }));
    expect(html.replace(/\s+/g, " ")).toContain("100 000");
    expect(html).toContain("SPY");
    expect(html).not.toContain("Váš vybraný fond:");
  });
});
