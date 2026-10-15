import React from "react";
import etfData from "../../data/etfs.json";
import { EtfRecord } from "../types/etf";
import { getCampaignCopy } from "../data/campaign-copy";
import { LandingPageClient } from "../components/LandingPageClient";

interface PageProps {
  searchParams?: Promise<{
    utm_content?: string | string[];
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const query = await searchParams;
  const campaign = getCampaignCopy(typeof query?.utm_content === "string" ? query.utm_content : undefined);
  const etfs = etfData.etfs as unknown as EtfRecord[];

  return <LandingPageClient etfs={etfs} campaign={campaign} investorContext={etfData.investorContext} />;
}
