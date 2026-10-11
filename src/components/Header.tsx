import React from "react";

export const Header: React.FC = () => {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border-light)",
        backgroundColor: "var(--bg-surface)",
        padding: "0.85rem 0",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.15rem",
              color: "var(--text-main)",
              letterSpacing: "-0.02em",
            }}
          >
            ETF Přehled
          </span>
          <span
            className="badge"
            style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}
          >
            S&amp;P 500
          </span>
        </div>

        <nav style={{ display: "flex", gap: "1rem", fontSize: "0.88rem" }}>
          <a
            href="#srovnani"
            style={{
              color: "var(--text-muted)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Srovnání
          </a>
          <a
            href="#kalkulacka"
            style={{
              color: "var(--text-muted)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Kalkulačka
          </a>
          <a
            href="#zdroje"
            style={{
              color: "var(--text-muted)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Zdroje
          </a>
        </nav>
      </div>
    </header>
  );
};
