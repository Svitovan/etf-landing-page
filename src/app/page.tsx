import React from "react";
import etfData from "../../data/etfs.json";
import { EtfRecord } from "../types/etf";
import { getCampaignCopy } from "../data/campaign-copy";
import { LandingPageClient } from "../components/LandingPageClient";

interface PageProps {
  searchParams?: {
    utm_content?: string;
  };
}

export default function HomePage({ searchParams }: PageProps) {
  const campaign = getCampaignCopy(searchParams?.utm_content);
  const etfs = etfData.etfs as unknown as EtfRecord[];

  return <LandingPageClient etfs={etfs} campaign={campaign} investorContext={etfData.investorContext} />;
}
