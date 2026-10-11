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

export default function ReportPage({ searchParams }: ReportPageProps) {
  const allEtfs = etfData.etfs as unknown as EtfRecord[];

  // Safe parsing of amount parameter
  const rawAmount = searchParams?.amount || String(DEFAULT_POSITION_CZK);
  const parsed = parseCzkInput(rawAmount);
  const positionValueCzk = parsed.value !== null ? parsed.value : DEFAULT_POSITION_CZK;

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
                    <th style={{ padding: "0.6rem 0.75rem", fontWeight: 700 }}>VOO</th>
                    <th style={{ padding: "0.6rem 0.75rem", fontWeight: 700 }}>IVV</th>
                    <th style={{ padding: "0.6rem 0.75rem", fontWeight: 700 }}>SPY</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600 }}>Správce</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>Vanguard</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>BlackRock</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>State Street</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600 }}>Burza</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>NYSE Arca</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>NYSE Arca</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>NYSE Arca</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600 }}>Expense Ratio</td>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 700, color: "var(--accent)" }}>0,03 % (Net)</td>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 700, color: "var(--accent)" }}>0,03 % (Net)</td>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 700, color: "var(--color-warning)" }}>0,0945 % (Gross)</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600 }}>Právní forma</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>Open-End Fund</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>Open-End Fund</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>Unit Investment Trust</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600 }}>Měna &amp; Domicil</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>USD / USA</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>USD / USA</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>USD / USA</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "0.55rem 0.75rem", fontWeight: 600 }}>Dividendy</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>Kvartální výplata</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>Kvartální výplata</td>
                    <td style={{ padding: "0.55rem 0.75rem" }}>Kvartální výplata</td>
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
              <div style={{ backgroundColor: "#ffffff", padding: "0.6rem", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>VOO</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--accent)" }}>
                  {formatCzk(comparison.costs["VOO"]?.annualCostCzk ?? 0, true)}
                </div>
              </div>
              <div style={{ backgroundColor: "#ffffff", padding: "0.6rem", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>IVV</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--accent)" }}>
                  {formatCzk(comparison.costs["IVV"]?.annualCostCzk ?? 0, true)}
                </div>
              </div>
              <div style={{ backgroundColor: "#ffffff", padding: "0.6rem", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>SPY</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--color-warning)" }}>
                  {formatCzk(comparison.costs["SPY"]?.annualCostCzk ?? 0, true)}
                </div>
              </div>
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
                Ověřte si ve své klientské zóně, zda vám broker umožňuje přímý nákup US tickerů (VOO, IVV, SPY). Pokud ne z důvodu absence KID dokumentu, požádejte o ekvivalent UCITS (např. SXR8 nebo VUAA).
              </div>

              <div style={{ padding: "0.75rem 1rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}>
                <strong style={{ color: "var(--accent)" }}>[ ] 2. Měnová konverze (CZK &rarr; USD): </strong>
                Zkontrolujte poplatek brokera za směnu. Rozpětí či poplatek přesahující 0,5 % může znamenat vyšší náklad než samotná roční správa fondu.
              </div>

              <div style={{ padding: "0.75rem 1rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}>
                <strong style={{ color: "var(--accent)" }}>[ ] 3. Formulář W-8BEN: </strong>
                Mějte u brokera podepsaný formulář W-8BEN, aby dividendy podléhaly 15% srážkové dani v USA namísto standardních 30 %.
              </div>

              <div style={{ padding: "0.75rem 1rem", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)" }}>
                <strong style={{ color: "var(--accent)" }}>[ ] 4. Poplatky za nákup a custody: </strong>
                Zjistěte, zda broker účtuje fixní poplatek za realizaci pokynu a zda neúčtuje měsíční/roční poplatek za úschovu zahraničních cenných papírů.
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
                <dt style={{ fontWeight: 700, color: "var(--text-main)" }}>Expense Ratio (Roční nákladovost):</dt>
                <dd style={{ color: "var(--text-muted)", marginLeft: 0 }}>
                  Procento z hodnoty majetku, které si správce fondu průběžně strhává na pokrytí provozních nákladů. Neplatí se převodem, je zohledněno v kurzu (NAV).
                </dd>
              </div>

              <div>
                <dt style={{ fontWeight: 700, color: "var(--text-main)" }}>KID (Key Information Document):</dt>
                <dd style={{ color: "var(--text-muted)", marginLeft: 0 }}>
                  Zákonem vyžadovaný třístránkový souhrn klíčových informací o produktu v jazyce daného státu EU.
                </dd>
              </div>

              <div>
                <dt style={{ fontWeight: 700, color: "var(--text-main)" }}>UCITS:</dt>
                <dd style={{ color: "var(--text-muted)", marginLeft: 0 }}>
                  Evropský standard pro fondy splňující přísná pravidla ochrany retailových investorů. UCITS fondy jsou běžně dostupné u všech evropských brokerů.
                </dd>
              </div>
            </dl>
          </section>

          {/* Footer note */}
          <footer
            style={{
              borderTop: "1px solid var(--border-light)",
              paddingTop: "1rem",
              fontSize: "0.78rem",
              color: "var(--text-light)",
              lineHeight: 1.45,
            }}
          >
            Materiál vygenerován pro vzdělávací účely &bull; Zdroje: oficiální factsheety Vanguard, BlackRock iShares, State Street Global Advisors a NYSE Arca &bull; Nenahrazuje odborné finanční ani daňové poradenství.
          </footer>
        </article>
      </div>
    </div>
  );
}
