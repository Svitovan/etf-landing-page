import React from "react";

export const Header: React.FC = () => {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border-light)",
        backgroundColor: "var(--bg-surface)",
        padding: "0.75rem 0",
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
          gap: "0.5rem",
        }}
      >
        <a
          href="#"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "var(--accent)",
              letterSpacing: "-0.02em",
            }}
          >
            ETF Přehled
          </span>
        </a>

        <nav
          style={{
            display: "flex",
            gap: "0.85rem",
            fontSize: "0.85rem",
            alignItems: "center",
          }}
        >
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
