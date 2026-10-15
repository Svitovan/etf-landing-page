import React from "react";
import type { Metadata } from "next";
import etfData from "../../../data/etfs.json";
import { EtfRecord } from "../../types/etf";
import {
  calculateComparison,
  formatCzk,
  parseCzkInput,
  DEFAULT_POSITION_CZK,
} from "../../lib/calculations";
import { PrintButton } from "./PrintButton";
import { ReportViewTracker } from "./ReportViewTracker";

export const metadata: Metadata = {
  title: "Přehled srovnání ETF a kontrolní seznam pro investora | ETF Přehled",
  description:
    "Rozšířený materiál se srovnáním VOO, IVV, SPY, výpočtem nákladů v Kč a kontrolním seznamem před nákupem u brokera.",
  robots: "noindex, nofollow",
};

interface ReportPageProps {
  searchParams?: {
    amount?: string;
    etfs?: string;
  };
}

const VALID_TICKERS = ["VOO", "IVV", "SPY"] as const;
type Ticker = (typeof VALID_TICKERS)[number];

export default function ReportPage({ searchParams }: ReportPageProps) {
  const allEtfs = etfData.etfs as unknown as EtfRecord[];

  // Safe parsing of amount and selected ETFs parameters
  const rawAmount = searchParams?.amount || String(DEFAULT_POSITION_CZK);
  const parsed = parseCzkInput(rawAmount);
  const positionValueCzk = parsed.value !== null ? parsed.value : DEFAULT_POSITION_CZK;

  // Safe allowlist filtering of requested tickers (B04)
  const rawEtfs = searchParams?.etfs || "";
  const parsedTickers: Ticker[] = rawEtfs
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter((t): t is Ticker => (VALID_TICKERS as readonly string[]).includes(t));

  const activeSelectedEtfs: Ticker[] =
    parsedTickers.length > 0 ? parsedTickers : ["VOO", "IVV", "SPY"];
  const isFilteredSelection = parsedTickers.length > 0 && parsedTickers.length < 3;

  // Comparison calculation
  const comparison = calculateComparison(positionValueCzk, allEtfs);

  return (
    <div
      style={{
        backgroundColor: "var(--bg-page)",
        minHeight: "100vh",
        paddingTop: "2rem",
        paddingBottom: "4rem",
      }}
    >
      <ReportViewTracker selectedEtfs={activeSelectedEtfs.join(",")} />
      <div className="container print-page" style={{ maxWidth: "780px" }}>
        {/* Navigation & Print Actions bar (hidden in print) */}
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.75rem",
            padding: "0.75rem 1rem",
            backgroundColor: "var(--bg-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-light)",
          }}
        >
          <a
            href="/"
            style={{
              textDecoration: "none",
              color: "var(--accent)",
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            &larr; Zpět na hlavní stránku
          </a>

          <PrintButton />
        </div>

        {/* The Printable Report Document */}
        <article
          style={{
            backgroundColor: "#ffffff",
            padding: "2.5rem 2rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-light)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Header */}
          <header
            style={{
              borderBottom: "2px solid var(--accent)",
              paddingBottom: "1.25rem",
              marginBottom: "1.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <h1
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "var(--text-main)",
                  letterSpacing: "-0.02em",
                }}
              >
                Srovnání ETF na S&amp;P 500 + kontrolní seznam
              </h1>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-light)",
                  fontWeight: 500,
                }}
              >
                Verze dat: {etfData.version} (k {etfData.updatedAt.substring(0, 10)})
              </span>
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.5 }}>
              Tento materiál shrnuje klíčové parametry amerických fondů VOO, IVV a SPY obchodovaných na NYSE Arca a přináší praktická doporučení pro české retailové investory.
            </p>

            {/* B04: Highlight chosen selection if user specified a subset */}
            {isFilteredSelection && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem 1rem",
                  backgroundColor: "rgba(0, 136, 85, 0.08)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  fontSize: "0.9rem",
                  color: "var(--text-main)",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>🎯</span>
                <div>
                  <strong>Váš vybraný fond:</strong> {activeSelectedEtfs.join(", ")}
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginLeft: "0.4rem" }}>
                    (v tabulce a kalkulaci je níže zvýrazněn pro snadné srovnání s alternativami)
                  </span>
                </div>
              </div>
            )}
          </header>

          {/* Section 1: Comparison Table */}
          <section style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--text-main)",
                marginBottom: "0.85rem",
              }}
            >
              1. Přehled parametrů fondů
            </h2>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.88rem",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-page)", borderBottom: "2px solid var(--border-light)" }}>
                    <th style={{ padding: "0.6rem 0.75rem", fontWeight: 700 }}>Ukazatel</th>
                    {(["VOO", "IVV", "SPY"] as const).map((ticker) => {
                      const isChosen = isFilteredSelection && activeSelectedEtfs.includes(ticker);
                      return (
                        <th
                          key={ticker}
                          style={{
                            padding: "0.6rem 0.75rem",
                            fontWeight: 700,
                            backgroundColor: isChosen ? "rgba(0, 136, 85, 0.12)" : undefined,
                            borderLeft: isChosen ? "2px solid var(--accent)" : undefined,
                            borderRight: isChosen ? "2px solid var(--accent)" : undefined,
                          }}
                        >
                          {ticker}
                          {isChosen && (
                            <span
                              style={{
                                display: "block",
                                fontSize: "0.65rem",
                                color: "var(--accent)",
                                fontWeight: 800,
                              }}
                            >
                              ★ VÁŠ VÝBĚR
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600 }}>Správce</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("VOO") ? "rgba(0, 136, 85, 0.04)" : undefined }}>Vanguard</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("IVV") ? "rgba(0, 136, 85, 0.04)" : undefined }}>BlackRock</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("SPY") ? "rgba(0, 136, 85, 0.04)" : undefined }}>State Street</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600 }}>Burza</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("VOO") ? "rgba(0, 136, 85, 0.04)" : undefined }}>NYSE Arca</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("IVV") ? "rgba(0, 136, 85, 0.04)" : undefined }}>NYSE Arca</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("SPY") ? "rgba(0, 136, 85, 0.04)" : undefined }}>NYSE Arca</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600 }}>Expense Ratio</td>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 700, color: "var(--accent)", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("VOO") ? "rgba(0, 136, 85, 0.04)" : undefined }}>0,03 % (Net)</td>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 700, color: "var(--accent)", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("IVV") ? "rgba(0, 136, 85, 0.04)" : undefined }}>0,03 % (Net)</td>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 700, color: "var(--color-warning)", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("SPY") ? "rgba(0, 136, 85, 0.04)" : undefined }}>0,0945 % (Gross)</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600 }}>Právní forma</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("VOO") ? "rgba(0, 136, 85, 0.04)" : undefined }}>Open-End Fund</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("IVV") ? "rgba(0, 136, 85, 0.04)" : undefined }}>Open-End Fund</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("SPY") ? "rgba(0, 136, 85, 0.04)" : undefined }}>Unit Investment Trust</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600 }}>Měna &amp; Domicil</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("VOO") ? "rgba(0, 136, 85, 0.04)" : undefined }}>USD / USA</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("IVV") ? "rgba(0, 136, 85, 0.04)" : undefined }}>USD / USA</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("SPY") ? "rgba(0, 136, 85, 0.04)" : undefined }}>USD / USA</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600 }}>Dividendy</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("VOO") ? "rgba(0, 136, 85, 0.04)" : undefined }}>Kvartální výplata</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("IVV") ? "rgba(0, 136, 85, 0.04)" : undefined }}>Kvartální výplata</td>
                    <td style={{ padding: "0.55rem 0.75rem", backgroundColor: isFilteredSelection && activeSelectedEtfs.includes("SPY") ? "rgba(0, 136, 85, 0.04)" : undefined }}>Kvartální výplata</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: Calculated Cost */}
          <section
            style={{
              marginBottom: "2rem",
              padding: "1.25rem",
              backgroundColor: "var(--bg-page)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-light)",
            }}
          >
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--text-main)",
                marginBottom: "0.5rem",
              }}
            >
              2. Modelové roční náklady pro investici {formatCzk(positionValueCzk)}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.75rem",
                margin: "1rem 0",
                textAlign: "center",
              }}
            >
              {(["VOO", "IVV", "SPY"] as const).map((ticker) => {
                const isChosen = isFilteredSelection && activeSelectedEtfs.includes(ticker);
                const isSpy = ticker === "SPY";
                const cost = comparison.costs[ticker]?.annualCostCzk ?? 0;
                return (
                  <div
                    key={ticker}
                    style={{
                      backgroundColor: "#ffffff",
                      padding: "0.75rem 0.5rem",
                      borderRadius: "var(--radius-sm)",
                      border: isChosen ? "2px solid var(--accent)" : "1px solid var(--border-light)",
                      boxShadow: isChosen ? "0 2px 8px rgba(0, 136, 85, 0.15)" : "none",
                    }}
                  >
                    {isChosen && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          backgroundColor: "var(--accent)",
                          color: "#ffffff",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "3px",
                          fontWeight: 700,
                          display: "inline-block",
                          marginBottom: "0.25rem",
                        }}
                      >
                        VÁŠ VÝBĚR
                      </span>
                    )}
                    <div style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>{ticker}</div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 800,
                        color: isSpy ? "var(--color-warning)" : "var(--accent)",
                      }}
                    >
                      {formatCzk(cost, true)}
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              <strong>Dopad v čase: </strong>
              Při hodnotě {formatCzk(positionValueCzk)} činí roční rozdíl mezi SPY a VOO/IVV přesně{" "}
              <strong>{formatCzk(comparison.maxDifferenceCzk, true)}</strong>. Za 10 let představuje tento rozdíl{" "}
              <strong>{formatCzk(comparison.maxDifferenceCzk * 10, true)}</strong> (při uvažované konstantní hodnotě portfolia).
            </p>
          </section>

          {/* Section 3: 5-Point Checklist */}
          <section style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--text-main)",
                marginBottom: "0.85rem",
              }}
            >
              3. Kontrolní seznam před nákupem u brokera
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.88rem" }}>
              <div style={{ padding: "0.75rem 1rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}>
                <strong style={{ color: "var(--accent)" }}>[ ] 1. Dostupnost fondu a nařízení PRIIPs: </strong>
                Ověřte si ve své klientské zóně, zda vám broker umožňuje přímý nákup US tickerů (VOO, IVV, SPY). Pokud ne z důvodu absence KID dokumentu v češtině, zjistěte dostupnost evropských UCITS alternativ sledujících index S&amp;P 500 (např. SXR8 nebo VUAA).
              </div>

              <div style={{ padding: "0.75rem 1rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}>
                <strong style={{ color: "var(--accent)" }}>[ ] 2. Měnová konverze (CZK &rarr; USD): </strong>
                Zkontrolujte poplatky a kurzové rozpětí svého brokera za směnu měny z CZK do USD před nákupem, neboť měnová konverze může představovat významný vstupní náklad.
              </div>

              <div style={{ padding: "0.75rem 1rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}>
                <strong style={{ color: "var(--accent)" }}>[ ] 3. Formulář W-8BEN: </strong>
                Mějte u brokera podepsaný formulář W-8BEN, který pro české daňové rezidenty umožňuje uplatnit sníženou 15% sazbu srážkové daně z dividend v USA dle smlouvy o zamezení dvojího zdanění namísto standardní 30% sazby.
              </div>

              <div style={{ padding: "0.75rem 1rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}>
                <strong style={{ color: "var(--accent)" }}>[ ] 4. Poplatky za nákup a custody: </strong>
                Zjistěte, zda broker účtuje fixní poplatek za realizaci pokynu a zda neúčtuje měsíční či roční poplatek za úschovu zahraničních cenných papírů.
              </div>

              <div style={{ padding: "0.75rem 1rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}>
                <strong style={{ color: "var(--accent)" }}>[ ] 5. Časový horizont a investiční cíl: </strong>
                Index S&amp;P 500 je 100% akciový index s krátkodobou volatilitou. Investujte pouze prostředky s minimálním doporučeným horizontem 5 a více let.
              </div>
            </div>
          </section>

          {/* Section 4: Glossary */}
          <section style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--text-main)",
                marginBottom: "0.85rem",
              }}
            >
              4. Malý slovníček pojmů
            </h2>

            <dl style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.6rem", fontSize: "0.85rem" }}>
              <div>
                <dt style={{ fontWeight: 700, color: "var(--text-main)" }}>Expense Ratio (Roční nákladovost fondu):</dt>
                <dd style={{ color: "var(--text-muted)", marginLeft: 0 }}>
                  Procento z hodnoty majetku, které si správce fondu průběžně strhává na pokrytí provozních nákladů. Neplatí se převodem, je plynule zohledněno v kurzu (NAV).
                </dd>
              </div>

              <div>
                <dt style={{ fontWeight: 700, color: "var(--text-main)" }}>NAV (Net Asset Value / Čistá hodnota aktiv):</dt>
                <dd style={{ color: "var(--text-muted)", marginLeft: 0 }}>
                  Tržní hodnota veškerého majetku fondu (akcií a hotovosti) po odečtení závazků, přepočtená na jeden podílový list. Stanovuje se po uzavření trhu a slouží jako férová hodnota, od níž se odvíjí burzovní cena.
                </dd>
              </div>

              <div>
                <dt style={{ fontWeight: 700, color: "var(--text-main)" }}>Bid-Ask Spread (Rozpětí nákupní a prodejní ceny):</dt>
                <dd style={{ color: "var(--text-muted)", marginLeft: 0 }}>
                  Rozdíl mezi nejvyšší nabídkou k nákupu (Bid) a nejnižší nabídkou k prodeji (Ask) na burze NYSE Arca. U velkých a likvidních indexových fondů bývá spread úzký, přesto představuje implicitní transakční náklad při realizaci každého pokynu.
                </dd>
              </div>

              <div>
                <dt style={{ fontWeight: 700, color: "var(--text-main)" }}>KID (Key Information Document / Sdělení klíčových informací):</dt>
                <dd style={{ color: "var(--text-muted)", marginLeft: 0 }}>
                  Zákonem vyžadovaný třístránkový souhrn informací v jazyce daného státu EU. Americké fondy (VOO, IVV, SPY) KID v češtině nemají, což je důvodem omezení u části retailových brokerů.
                </dd>
              </div>

              <div>
                <dt style={{ fontWeight: 700, color: "var(--text-main)" }}>Reinvestování dividend (Akumulační vs. Distribuční fondy):</dt>
                <dd style={{ color: "var(--text-muted)", marginLeft: 0 }}>
                  US ETF fondy jsou distribuční a dividendy vyplácejí v hotovosti na účet investora (u amerických dividend se obvykle uplatňuje srážková daň, v ČR se daňové dopady řídí zákonem o daních z příjmů). Evropské alternativy (UCITS) často nabízejí akumulační třídu („Acc“), která dividendy reinvestuje uvnitř fondu.
                </dd>
              </div>

              <div>
                <dt style={{ fontWeight: 700, color: "var(--text-main)" }}>UCITS:</dt>
                <dd style={{ color: "var(--text-muted)", marginLeft: 0 }}>
                  Evropský regulační standard pro fondy splňující přísná pravidla ochrany retailových investorů v EU.
                </dd>
              </div>
            </dl>
          </section>

          {/* Footer note with clickable primary sources */}
          <footer
            style={{
              borderTop: "1px solid var(--border-light)",
              paddingTop: "1rem",
              fontSize: "0.78rem",
              color: "var(--text-light)",
              lineHeight: 1.5,
            }}
          >
            <div>
              <strong>Ověřené primární zdroje dat (NYSE Arca):</strong>
            </div>
            <div style={{ marginTop: "0.3rem", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <a
                href="https://investor.vanguard.com/investment-products/etfs/profile/voo"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}
              >
                Vanguard VOO Profile &amp; Prospectus &rarr;
              </a>
              <a
                href="https://www.ishares.com/us/products/239726/ishares-core-sp-500-etf-ivv"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}
              >
                iShares IVV Factsheet &rarr;
              </a>
              <a
                href="https://www.ssga.com/us/en/individual/etfs/state-street-spdr-sp-500-etf-trust-spy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}
              >
                State Street SPY Prospectus &rarr;
              </a>
              <a
                href="https://www.nyse.com/markets/nyse-arca"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}
              >
                NYSE Arca Trading &rarr;
              </a>
            </div>
            <div style={{ marginTop: "0.6rem" }}>
              Materiál vygenerován pro vzdělávací účely. Nenahrazuje odborné finanční ani daňové poradenství.
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
