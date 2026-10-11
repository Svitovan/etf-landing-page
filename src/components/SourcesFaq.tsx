import React from "react";
import { EtfRecord } from "../types/etf";

interface SourcesFaqProps {
  etfs: EtfRecord[];
}

export const SourcesFaq: React.FC<SourcesFaqProps> = ({ etfs }) => {
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
                fontSize: "clamp(1.4rem, 3.5vw, 1.85rem)",
                fontWeight: 800,
                color: "var(--text-main)",
                letterSpacing: "-0.02em",
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
                  VOO, IVV a SPY jsou tři největší a nejlikvidnější fondy na světě sledující identický index (S&amp;P 500). Díky tomu můžete srovnávat skutečné rozdíly v nákladech fondu a struktuře, aniž by byl výsledek zkreslen jinou investiční strategií.
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
                  Proč má SPY vyšší nákladovost (0,0945 %) než VOO a IVV (0,03 %)?
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  SPY vznikl v roce 1993 jako Unit Investment Trust (UIT), což je starší právní forma s přísnějšími provozními omezeními. Výměnou za to má SPY největší denní objem obchodů a minimální spready, což ocení brokeři a velcí obchodníci. Pro pasivní dlouhodobé držení jsou však VOO i IVV levnější.
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
                  Kvůli směrnici PRIIPs vyžaduje EU klíčové informace (KID) v češtině, které US fondy často nemají. V takovém případě se u brokera podívejte na evropské ekvivalenty se sídlem v Irsku (označované jako UCITS, např. SXR8 nebo VUAA).
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
