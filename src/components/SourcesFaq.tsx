import React from "react";
import { EtfRecord, InvestorContext } from "../types/etf";
import { SourceLinks } from "./SourceLinks";
import { formatExpenseRatio } from "../lib/calculations";

interface SourcesFaqProps {
  etfs: EtfRecord[];
  context: InvestorContext;
}

export const SourcesFaq: React.FC<SourcesFaqProps> = ({ etfs, context }) => {
  return (
    <section
      id="zdroje"
      style={{
        paddingTop: "3rem",
        paddingBottom: "3rem",
        backgroundColor: "var(--bg-surface)",
        borderTop: "1px solid var(--border-light)",
      }}
    >
      <div className="container">
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          {/* FAQ */}
          <div style={{ marginBottom: "2.5rem" }}>
            <span className="badge">Časté otázky (FAQ)</span>
            <h2
              style={{
                fontSize: "clamp(1.4rem, 3.5vw, 1.95rem)",
                fontWeight: 500,
                fontFamily: "var(--font-serif)",
                color: "var(--text-main)",
                letterSpacing: "-0.015em",
                marginTop: "0.5rem",
                marginBottom: "1.25rem",
              }}
            >
              Otázky a odpovědi ke srovnání ETF
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div
                style={{
                  padding: "1rem 1.25rem",
                  backgroundColor: "var(--bg-page)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.3rem" }}>
                  Proč porovnáváte zrovna tyto tři fondy?
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  VOO, IVV a SPY sledují stejný index S&amp;P 500. Srovnání se proto soustředí na nákladovost a právní strukturu; není žebříčkem velikosti, likvidity ani doporučením konkrétního fondu.
                </p>
              </div>

              <div
                style={{
                  padding: "1rem 1.25rem",
                  backgroundColor: "var(--bg-page)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.3rem" }}>
                  Jak se liší roční nákladovost fondů?
                </h3>
                <ul style={{ fontSize: "0.85rem", color: "var(--text-muted)", paddingLeft: "1.2rem", marginBottom: "0.5rem" }}>
                  {etfs.map(etf => <li key={etf.id}>{etf.ticker.value}: {formatExpenseRatio(etf.expenseRatio.value)}</li>)}
                </ul>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Jde o rozdílné produkty s různou právní strukturou a zveřejněnými náklady. Nižší Expense Ratio samo o sobě neznamená nižší celkové náklady obchodu; ty závisejí také na brokerovi, měnové konverzi a spreadu. Z právní formy nelze samotné odvodit příčinu konkrétní sazby poplatku.
                </p>
              </div>

              <div
                style={{
                  padding: "1rem 1.25rem",
                  backgroundColor: "var(--bg-page)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.3rem" }}>
                  Co když mi můj broker americká ETF neumožní koupit?
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {context.priips.value} Pokud produkt není dostupný, zeptejte se na jiný produkt se stejným benchmarkem a vhodnou dokumentací; jeho náklady, rizika a daňové zacházení posuzujte samostatně.
                  <SourceLinks evidence={context.priips.evidence} />
                </p>
              </div>
            </div>
          </div>

          {/* Primary Sources Directory */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem" }}>
              Auditované primární zdroje dat:
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              Všechny údaje na této stránce jsou ručně ověřeny z oficiálních materiálů emitentů a burzy:
            </p>

            <ul style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, paddingLeft: "1.2rem" }}>
              {etfs.map((e) => {
                const ev = e.expenseRatio.evidence[0];
                return (
                  <li key={e.id}>
                    <strong>{e.ticker.value} ({e.issuer.value}): </strong>
                    <a href={ev.url} target="_blank" rel="noopener noreferrer">
                      {ev.title}
                    </a>
                    {ev.asOf ? ` (stav k ${ev.asOf})` : ""} &bull; Ověřeno: {ev.checkedAt.substring(0, 10)}
                  </li>
                );
              })}
              <li>
                <strong>Burza NYSE Arca: </strong>
                <a
                  href="https://www.nyse.com/products/exchange-traded-products/exchange-traded-funds"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NYSE Exchange Traded Products Directory
                </a>
              </li>
              <li>
                <strong>Regulace EU PRIIPs (čl. 5 a 13): </strong>
                <a
                  href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32014R1286"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  EUR-Lex Nařízení (EU) č. 1286/2014
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
