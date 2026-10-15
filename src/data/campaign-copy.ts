export interface CampaignHeadline {
  badge: string;
  headline: string;
  subheadline: string;
  heroCta: string;
}

export const CAMPAIGN_VARIANTS: Record<string, CampaignHeadline> = {
  ad_a: {
    badge: "Srovnání ETF na S&P 500",
    headline: "VOO, IVV, SPY: jaký je mezi nimi skutečný rozdíl?",
    subheadline:
      "Tři americká ETF sledují stejný index S&P 500. Podívejte se na rozdíly v nákladech, struktuře a co si před nákupem ověřit jako český investor.",
    heroCta: "Zobrazit srovnání fondů",
  },
  ad_b: {
    badge: "Kalkulačka nákladů ETF",
    headline: "Kolik vás stojí ETF v korunách na poplatcích fondu?",
    subheadline:
      "Zadejte hodnotu své investice a spočítejte si orientační roční náklady u VOO, IVV a SPY. Zjistěte, kolik dělá rozdíl za 10 let.",
    heroCta: "Spočítat náklady v Kč",
  },
};

export const DEFAULT_COPY: CampaignHeadline = {
  badge: "Nezávislé vzdělávací srovnání",
  headline: "VOO, IVV, SPY: v čem se liší ETF na S&P 500?",
  subheadline:
    "Porovnejte náklady tří ETF obchodovaných na NYSE Arca a zjistěte, co si ověřit jako český investor ještě před prvním nákupem.",
  heroCta: "Porovnat ETF zdarma",
};

export function getCampaignCopy(utmContent?: string | null): CampaignHeadline {
  if (utmContent && utmContent in CAMPAIGN_VARIANTS) {
    return CAMPAIGN_VARIANTS[utmContent];
  }
  return DEFAULT_COPY;
}
