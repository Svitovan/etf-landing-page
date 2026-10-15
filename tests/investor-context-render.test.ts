import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import dataset from "../data/etfs.json";
import { CzechContext } from "../src/components/CzechContext";
import ReportPage from "../src/app/report/page";

describe("Visible source attribution in landing context and report", () => {
  it.each([
    { name: "landing context", render: () => React.createElement(CzechContext, { context: dataset.investorContext }) },
    { name: "report", render: () => ReportPage({ searchParams: { amount: "100000", etfs: "VOO" } }) },
  ])("renders conditional tax wording and primary-source links in $name", ({ render }) => {
    const html = renderToStaticMarkup(render());
    expect(html).toContain("Nejde o automatickou sazbu");
    for (const claim of [dataset.investorContext.priips, dataset.investorContext.dividendTreaty,
      dataset.investorContext.w8ben, dataset.investorContext.withholding]) {
      for (const source of claim.evidence) expect(html).toContain(`href="${source.url}"`);
    }
    expect(html).not.toContain("KID v češtině nemají");
  });
});
