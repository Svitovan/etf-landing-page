"use client";

import React, { useState, useEffect } from "react";
import { EtfRecord } from "../types/etf";
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

interface LandingPageClientProps {
  etfs: EtfRecord[];
  campaign: CampaignHeadline;
}

export const LandingPageClient: React.FC<LandingPageClientProps> = ({
  etfs,
  campaign,
}) => {
  const [positionValueCzk, setPositionValueCzk] = useState<number>(100_000);
  const selectedEtfs = ["VOO", "IVV", "SPY"];

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
        <Hero campaign={campaign} />
        <EtfComparison etfs={etfs} />
        <CostCalculator
          etfs={etfs}
          onCalculationChange={handleCalculationChange}
        />
        <CzechContext />
        <LeadMagnet
          selectedEtfs={selectedEtfs}
          positionValueCzk={positionValueCzk}
        />
        <SourcesFaq etfs={etfs} />
      </main>
      <Footer />
      <ConsentBanner />
    </>
  );
};
