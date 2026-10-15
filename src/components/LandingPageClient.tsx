"use client";

import React, { useState, useEffect } from "react";
import { EtfRecord, InvestorContext } from "../types/etf";
import { CampaignHeadline } from "../data/campaign-copy";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { EtfComparison } from "./EtfComparison";
import { CostCalculator } from "./CostCalculator";
import { CzechContext } from "./CzechContext";
import { LeadMagnet } from "./LeadMagnet";
import { SourcesFaq } from "./SourcesFaq";
import { Footer } from "./Footer";
import { ConsentBanner } from "./ConsentBanner";
import { trackEvent, getConsentStatus } from "../lib/analytics-client";
import { DEFAULT_POSITION_CZK } from "../lib/calculations";

interface LandingPageClientProps {
  etfs: EtfRecord[];
  campaign: CampaignHeadline;
  investorContext: InvestorContext;
}

export const LandingPageClient: React.FC<LandingPageClientProps> = ({
  etfs,
  campaign,
  investorContext,
}) => {
  const [positionValueCzk, setPositionValueCzk] = useState<number>(DEFAULT_POSITION_CZK);
  const [selectedEtfs, setSelectedEtfs] = useState<string[]>(["VOO", "IVV", "SPY"]);

  useEffect(() => {
    // If user already granted consent in previous visit, track landing view
    if (getConsentStatus() === "granted") {
      trackEvent("landing_observed", { pageVersion: "v1" });
    }
  }, []);

  const handleCalculationChange = (newVal: number) => {
    setPositionValueCzk(newVal);
    trackEvent("calculator_used", { selectedEtfs: selectedEtfs.join(",") });
  };

  return (
    <>
      <Header />
      <main id="main-content">
        <Hero campaign={campaign} etfs={etfs} />
        <EtfComparison etfs={etfs} investorContext={investorContext} onSelectEtfs={setSelectedEtfs} />
        <CostCalculator
          etfs={etfs}
          onCalculationChange={handleCalculationChange}
        />
        <CzechContext context={investorContext} />
        <LeadMagnet
          selectedEtfs={selectedEtfs}
          positionValueCzk={positionValueCzk}
        />
        <SourcesFaq etfs={etfs} context={investorContext} />
      </main>
      <Footer />
      <ConsentBanner />
    </>
  );
};
