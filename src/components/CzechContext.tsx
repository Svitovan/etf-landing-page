import React from "react";

export const CzechContext: React.FC = () => {
  return (
    <section
      style={{
        paddingTop: "2.5rem",
        paddingBottom: "2.5rem",
        backgroundColor: "var(--bg-surface)",
        borderTop: "1px solid var(--border-light)",
        borderBottom: "1px solid var(--border-light)",
      }}
    >
      <div className="container">
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <span className="badge">3. Krok: Kontext pro českého investora</span>
            <h2
              style={{
                fontSize: "clamp(1.4rem, 3.5vw, 1.85rem)",
                fontWeight: 800,
                color: "var(--text-main)",
                letterSpacing: "-0.02em",
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              Co si ověřit před nákupem u českého brokera?
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Nákup amerických ETF z České republiky má svá specifika. Zde jsou tři nejdůležitější pravidla:
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--border-light)",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                1. Nařízení PRIIPs a dokument KID
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.55 }}>
                Evropská legislativa vyžaduje, aby fond měl pro retailového investora klíčový informační dokument (KID) v národním jazyce. Americké ETF (VOO, IVV, SPY) podléhají regulaci SEC a KID často nemají. Váš broker (XTB, Portu, Fio, IBKR) vám proto může nákup přímo omezit nebo nabídnout evropskou alternativu UCITS.
              </p>
            </div>

            <div
              style={{
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--border-light)",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                2. Měnové poplatky (CZK &rarr; USD)
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.55 }}>
                Všechny tři fondy jsou kótovány v USD. Poplatek brokera za směnu měny (často 0,5 % až 1,5 %) může převýšit i několikaletý rozdíl v roční nákladovosti samotného fondu. Vždy si zjistěte kurzové podmínky u své platformy.
              </p>
            </div>

            <div
              style={{
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--border-light)",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.4rem" }}>
                3. Daně a dividendy (Formulář W-8BEN)
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.55 }}>
                Jelikož jde o fondy se sídlem v USA s kvartální výplatou dividend, u amerického brokera je nutné mít podepsaný formulář W-8BEN, který snižuje srážkovou daň z dividend na 15 % dle smlouvy o zamezení dvojího zdanění.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
